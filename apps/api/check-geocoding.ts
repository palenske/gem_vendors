import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Checking geocoding status...\n");

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

  console.log(`Found ${failedGeocoding.length} resellers without geocoding:\n`);

  for (const reseller of failedGeocoding) {
    console.log(`ID: ${reseller.id}`);
    console.log(`  Name: ${reseller.name}`);
    console.log(
      `  Address: ${reseller.street}, ${reseller.number}, ${reseller.neighborhood}, ${reseller.city} - ${reseller.state}`,
    );
    console.log(`  CEP: ${reseller.zipCode}`);
    console.log(`  Status: ${reseller.status}`);
    console.log(`  Created: ${reseller.createdAt.toISOString()}`);
    console.log(`  Updated: ${reseller.updatedAt.toISOString()}`);
    console.log();
  }

  // Summary
  const total = await prisma.reseller.count();
  const geocoded = await prisma.reseller.count({
    where: {
      latitude: { not: null },
      longitude: { not: null },
    },
  });

  console.log(`\nSummary:`);
  console.log(`  Total resellers: ${total}`);
  console.log(`  Geocoded: ${geocoded}`);
  console.log(`  Failed: ${failedGeocoding.length}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
