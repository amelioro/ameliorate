import { xprisma } from "@/db/extendedPrisma";

const cleanupOrphanedRecords = async () => {
  console.log("Starting cleanup of orphaned UserScores.");

  // Delete all scores that don't match any Node or Edge
  // because the graphPartId can point to a Node or an Edge we need to check both
  const deletedCount = await xprisma.$executeRaw`
    DELETE FROM "userScores"
    WHERE NOT EXISTS (
      SELECT 1 FROM nodes WHERE nodes.id = "userScores"."graphPartId"
    )
    AND NOT EXISTS (
      SELECT 1 FROM edges WHERE edges.id = "userScores"."graphPartId"
    )
  `;

  if (deletedCount === 0) {
    console.log("No orphaned scores found. Database is clean!");
    return;
  }

  console.log(`Successfully deleted ${deletedCount} orphaned scores!`);
};

cleanupOrphanedRecords()
  .catch((e: unknown) => {
    console.error("Cleanup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await xprisma.$disconnect();
  });
