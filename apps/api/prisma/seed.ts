import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

const NOMINATIM_USER_AGENT = process.env.NOMINATIM_USER_AGENT || 'localizador-revendedoras-dev';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const RATE_LIMIT_DELAY_MS = 1100; // 1.1s between requests
const FAILURES_LOG_PATH = path.join(__dirname, '../../seed-failures.log');

interface CsvRow {
  id: string;
  nome_revendedora: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  status: string;
}

function normalizeStatus(status: string): 'ATIVA' | 'INATIVA' | 'EM_PROSPECCAO' {
  const lower = status.toLowerCase().trim();
  if (lower === 'ativa') return 'ATIVA';
  if (lower === 'inativa') return 'INATIVA';
  if (lower.includes('prospecção') || lower.includes('prospeccao')) return 'EM_PROSPECCAO';
  throw new Error(`Unknown status: ${status}`);
}

function normalizeCep(cep: string): string {
  // Keep the formatted version (with hyphen)
  return cep.trim();
}

function stripBom(text: string): string {
  return text.replace(/^\uFEFF/, '');
}

async function geocode(address: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const params = new URLSearchParams({
      q: address,
      format: 'json',
      limit: '1',
    });

    const response = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: {
        'User-Agent': NOMINATIM_USER_AGENT,
      },
    });

    if (!response.ok) {
      console.error(`Nominatim HTTP error: ${response.status} for address: ${address}`);
      return null;
    }

    const data = await response.json() as Array<{ lat: string; lon: string }>;

    if (data.length === 0) {
      return null;
    }

    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
    };
  } catch (error) {
    console.error(`Geocoding error for address "${address}":`, error);
    return null;
  }
}

function logFailure(id: string, name: string, address: string, reason: string) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ID: ${id} | Name: ${name} | Address: ${address} | Reason: ${reason}\n`;
  fs.appendFileSync(FAILURES_LOG_PATH, logEntry);
}

async function main() {
  console.log('Starting seed...');

  // Read CSV file
  const csvPath = path.join(__dirname, '../../../data/Base_200_Revendedoras_Fake.csv');
  const csvContent = stripBom(fs.readFileSync(csvPath, 'utf-8'));

  const records = parse(csvContent, {
    delimiter: ';',
    columns: true,
    skip_empty_lines: true,
  }) as CsvRow[];

  console.log(`Found ${records.length} records in CSV`);

  let successCount = 0;
  let failCount = 0;

  for (const record of records) {
    const id = parseInt(record.id, 10);
    const name = record.nome_revendedora.trim();
    const street = record.rua.trim();
    const number = record.numero.trim();
    const neighborhood = record.bairro.trim();
    const city = record.cidade.trim();
    const state = record.estado.trim();
    const zipCode = normalizeCep(record.cep);
    const status = normalizeStatus(record.status);

    // Construct full address for geocoding
    const fullAddress = `${street}, ${number}, ${neighborhood}, ${city}, ${state}, ${zipCode}, Brasil`;

    console.log(`Geocoding: ${fullAddress}`);

    // Try full address first
    let coords = await geocode(fullAddress);

    // If full address fails, try CEP only
    if (!coords) {
      console.log(`  Full address failed, trying CEP: ${zipCode}`);
      coords = await geocode(`${zipCode}, Brasil`);
    }

    if (!coords) {
      console.log(`  Failed to geocode ID ${id}`);
      logFailure(String(id), name, fullAddress, 'Nominatim returned no results');
      failCount++;
    } else {
      console.log(`  Geocoded: ${coords.latitude}, ${coords.longitude}`);
      successCount++;
    }

    // Upsert the record
    await prisma.reseller.upsert({
      where: { id },
      create: {
        id,
        name,
        street,
        number,
        neighborhood,
        city,
        state,
        zipCode,
        status,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
        geocodedAt: coords ? new Date() : null,
      },
      update: {
        name,
        street,
        number,
        neighborhood,
        city,
        state,
        zipCode,
        status,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
        geocodedAt: coords ? new Date() : null,
      },
    });

    // Rate limit
    await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
  }

  console.log('\nSeed completed!');
  console.log(`  Success: ${successCount}`);
  console.log(`  Failed: ${failCount}`);
  console.log(`  Total: ${records.length}`);

  // Verify record count
  const count = await prisma.reseller.count();
  console.log(`  Database count: ${count}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
