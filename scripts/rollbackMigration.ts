import { $ } from "execa";
import yargs from "yargs/yargs";

import { xprisma } from "../src/db/extendedPrisma";

// rollback the last-run migration
// assumes [migration_dir]/down.sql exists
const rollbackMigration = async () => {
  // e.g. tsx rollbackMigration.ts --dryrun=true
  const argv = await yargs(process.argv.slice(2)).options({
    dryrun: { type: "boolean", demandOption: true },
  }).argv;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- `as` does seem to add correct type, not sure why this is throwing
  const result = (await xprisma.$queryRaw`\
    SELECT migration_name \
      FROM _prisma_migrations \
      WHERE rolled_back_at IS NULL \
      ORDER BY finished_at DESC \
      LIMIT 1;`) as { migration_name: string }[];

  const migrationToRollback = result[0]?.migration_name;

  if (!migrationToRollback) {
    console.log("No migration to rollback");
    return;
  }

  if (argv.dryrun) {
    console.log(`Would rollback migration: ${migrationToRollback}`);
    return;
  }

  console.log(`Rolling back migration: ${migrationToRollback}`);

  await $`prisma db execute \
  --file src/db/migrations/${migrationToRollback}/down.sql \
  --schema src/db/schema.prisma`;

  // Not using `prisma migrate resolve` because that requires the migration to have failed.
  // Setting `rolled_back_at` might have benefits because it maintains the started_at, checksum, etc, (https://github.com/prisma/prisma-engines/blob/bb8e7aae27ce478f586df41260253876ccb5b390/schema-engine/ARCHITECTURE.md#the-_prisma_migrations-table)
  // but that doesn't seem necessary.
  await xprisma.$executeRaw`\
    DELETE FROM _prisma_migrations \
      WHERE migration_name = ${migrationToRollback};`;
};

// not sure how to use top-level await without messing with project config
rollbackMigration()
  .then(() => console.log("done running rollback script"))
  .catch((error: unknown) => console.log("issues running rollback script, error: \n", error));
