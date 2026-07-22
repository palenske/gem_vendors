import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const NOMINATIM_USER_AGENT =
  process.env.NOMINATIM_USER_AGENT || "localizador-revendedoras-dev";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const RATE_LIMIT_DELAY_MS = 1500; // 1.5s between requests (increased)
const MAX_RETRIES = 3;

interface GeocodeResult {
  latitude: number;
  longitude: number;
}

async function geocode(
  address: string,
  attempt: number = 1,
): Promise<GeocodeResult | null> {
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
        `  [Attempt ${attempt}] Nominatim HTTP error: ${response.status} for address: ${address}`,
      );
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) =>
          setTimeout(resolve, RATE_LIMIT_DELAY_MS * attempt),
        );
        return geocode(address, attempt + 1);
      }
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
    console.error(
      `  [Attempt ${attempt}] Geocoding error for address "${address}":`,
      error,
    );
    if (attempt < MAX_RETRIES) {
      await new Promise((resolve) =>
        setTimeout(resolve, RATE_LIMIT_DELAY_MS * attempt),
      );
      return geocode(address, attempt + 1);
    }
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
): Promise<GeocodeResult | null> {
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
    // Strategy 6: Neighborhood + city + state
    `${neighborhood}, ${city}, ${state}, Brasil`,
    // Strategy 7: City + state (fallback to city center)
    `${city}, ${state}, Brasil`,
  ];

  for (let i = 0; i < strategies.length; i++) {
    const strategy = strategies[i];
    console.log(
      `  [Strategy ${i + 1}] Trying: ${strategy.substring(0, 80)}...`,
    );

    const coords = await geocode(strategy);
    if (coords) {
      console.log(`  ✓ Success with strategy ${i + 1}`);
      return coords;
    }

    console.log(`  ✗ Strategy ${i + 1} failed`);
    await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
  }

  return null;
}

async function main() {
  console.log("Starting geocoding retry for failed records...\n");

  // Find all resellers without geocoding
  const failedGeocoding = await prisma.reseller.findMany({
    where: {
      latitude: null,
      longitude: null,
    },
    orderBy: {
      id: "asc",
    },
  });

  console.log(`Found ${failedGeocoding.length} resellers without geocoding\n`);

  let successCount = 0;
  let failCount = 0;

  for (const reseller of failedGeocoding) {
    console.log(`\n[${reseller.id}] ${reseller.name}`);
    console.log(
      `  Address: ${reseller.street}, ${reseller.number}, ${reseller.neighborhood}, ${reseller.city} - ${reseller.state}`,
    );
    console.log(`  CEP: ${reseller.zipCode}`);

    const coords = await geocodeWithFallbacks(
      reseller.street,
      reseller.number,
      reseller.neighborhood,
      reseller.city,
      reseller.state,
      reseller.zipCode,
    );

    if (coords) {
      console.log(`  ✓ Geocoded: ${coords.latitude}, ${coords.longitude}`);

      await prisma.reseller.update({
        where: { id: reseller.id },
        data: {
          latitude: coords.latitude,
          longitude: coords.longitude,
          geocodedAt: new Date(),
        },
      });

      successCount++;
    } else {
      console.log(`  ✗ All strategies failed`);
      failCount++;
    }

    // Rate limit between records
    await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
  }

  console.log("\n\n=== Retry Results ===");
  console.log(`  Successfully geocoded: ${successCount}`);
  console.log(`  Still failed: ${failCount}`);
  console.log(`  Total attempted: ${failedGeocoding.length}`);

  // Final summary
  const total = await prisma.reseller.count();
  const geocoded = await prisma.reseller.count({
    where: {
      latitude: { not: null },
      longitude: { not: null },
    },
  });

  console.log(`\nDatabase summary:`);
  console.log(`  Total resellers: ${total}`);
  console.log(`  Geocoded: ${geocoded}`);
  console.log(`  Failed: ${total - geocoded}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Retry failed:", e);
  process.exit(1);
});
