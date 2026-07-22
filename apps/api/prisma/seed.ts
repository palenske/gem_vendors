import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { parse } from "csv-parse/sync";
import * as fs from "fs";
import * as path from "path";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const NOMINATIM_USER_AGENT =
  process.env.NOMINATIM_USER_AGENT || "localizador-revendedoras-dev";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const RATE_LIMIT_DELAY_MS = 1100; // 1.1s between requests
const FAILURES_LOG_PATH = path.join(__dirname, "../../seed-failures.log");

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

function normalizeStatus(
  status: string,
): "ATIVA" | "INATIVA" | "EM_PROSPECCAO" {
  const lower = status.toLowerCase().trim();
  if (lower === "ativa") return "ATIVA";
  if (lower === "inativa") return "INATIVA";
  if (lower.includes("prospecção") || lower.includes("prospeccao"))
    return "EM_PROSPECCAO";
  throw new Error(`Unknown status: ${status}`);
}

function normalizeCep(cep: string): string {
  // Keep the formatted version (with hyphen)
  return cep.trim();
}

function stripBom(text: string): string {
  return text.replace(/^\uFEFF/, "");
}

async function geocode(
  address: string,
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const params = new URLSearchParams({
      q: address,
      format: "json",
      limit: "1",
      addressdetails: "1",
    });

    const response = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: {
        "User-Agent": NOMINATIM_USER_AGENT,
      },
    });

    if (!response.ok) {
      console.error(
        `Nominatim HTTP error: ${response.status} for address: ${address}`,
      );
      return null;
    }

    const data = (await response.json()) as Array<{ lat: string; lon: string }>;

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

async function geocodeWithFallbacks(
  street: string,
  number: string,
  neighborhood: string,
  city: string,
  state: string,
  zipCode: string,
): Promise<{ latitude: number; longitude: number } | null> {
  const strategies = [
    // Strategy 1: Full address (original)
    `${street}, ${number}, ${neighborhood}, ${city}, ${state}, ${zipCode}, Brasil`,
    // Strategy 2: Full address without neighborhood
    `${street}, ${number}, ${city}, ${state}, ${zipCode}, Brasil`,
    // Strategy 3: Street + number + city + state
    `${street}, ${number}, ${city}, ${state}, Brasil`,
    // Strategy 4: CEP only
    `${zipCode}, Brasil`,
    // Strategy 5: Street + city + state (without number)
    `${street}, ${city}, ${state}, Brasil`,
    // Strategy 6: Neighborhood + city + state (useful for common street names)
    `${neighborhood}, ${city}, ${state}, Brasil`,
    // Strategy 7: City + state (fallback to city center)
    `${city}, ${state}, Brasil`,
  ];

  for (let i = 0; i < strategies.length; i++) {
    const strategy = strategies[i];
    const coords = await geocode(strategy);
    if (coords) {
      console.log(`  ✓ Strategy ${i + 1} succeeded`);
      return coords;
    }
    console.log(
      `  ✗ Strategy ${i + 1} failed: ${strategy.substring(0, 60)}...`,
    );
    await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
  }

  return null;
}

function logFailure(id: string, name: string, address: string, reason: string) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ID: ${id} | Name: ${name} | Address: ${address} | Reason: ${reason}\n`;
  fs.appendFileSync(FAILURES_LOG_PATH, logEntry);
}

async function main() {
  console.log("Starting seed...");

  // Read CSV file
  const csvPath = path.join(
    __dirname,
    "../../../data/Base_200_Revendedoras_Fake.csv",
  );
  const csvContent = stripBom(fs.readFileSync(csvPath, "utf-8"));

  const records: CsvRow[] = parse(csvContent, {
    delimiter: ";",
    columns: true,
    skip_empty_lines: true,
  });

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

    console.log(`Geocoding ID ${id}: ${name}`);

    // Try multiple geocoding strategies
    const coords = await geocodeWithFallbacks(
      street,
      number,
      neighborhood,
      city,
      state,
      zipCode,
    );

    if (!coords) {
      console.log(`  ✗ All geocoding strategies failed for ID ${id}`);
      const fullAddress = `${street}, ${number}, ${neighborhood}, ${city}, ${state}, ${zipCode}, Brasil`;
      logFailure(
        String(id),
        name,
        fullAddress,
        "All geocoding strategies failed",
      );
      failCount++;
    } else {
      console.log(`  ✓ Geocoded: ${coords.latitude}, ${coords.longitude}`);
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

  console.log("\nSeed completed!");
  console.log(`  Success: ${successCount}`);
  console.log(`  Failed: ${failCount}`);
  console.log(`  Total: ${records.length}`);

  // Verify record count
  const count = await prisma.reseller.count();
  console.log(`  Database count: ${count}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
