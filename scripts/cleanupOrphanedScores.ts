import { prisma } from "@/db/basePrisma";

async function main() {
  console.log("Starting cleanup of orphaned UserScores.");

  // Find all score IDs that don't match any Node or Edge
  // because the graphPartId can point to a Node or an Edge we need to check both
  const orphanedScores = await prisma.$queryRaw<{ username: string; graphPartId: string }[]>`
    SELECT us.username, us."graphPartId"
    FROM "userScores" us
    LEFT JOIN nodes n ON us."graphPartId" = n.id
    LEFT JOIN edges e ON us."graphPartId" = e.id
    WHERE n.id IS NULL AND e.id IS NULL
  `;

  if (orphanedScores.length === 0) {
    console.log("No orphaned scores found. Database is clean!");
    return;
  }

  console.log(`Found ${orphanedScores.length} orphaned scores. Cleaning up...`);

  console.log(`Found ${orphanedScores.length} orphaned scores. Cleaning up...`);

  // Delete orphaned scores in parallel
  //Use map to delete each score in parallel
  await Promise.all(
    orphanedScores.map((score) =>
      prisma.userScore.delete({
        where: {
          username_graphPartId: {
            username: score.username,
            graphPartId: score.graphPartId,
          },
        },
      }),
    ),
  );

  console.log(`Successfully deleted ${orphanedScores.length} orphaned scores!`);
}

main()
  .catch((e: unknown) => {
    console.error("Cleanup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
