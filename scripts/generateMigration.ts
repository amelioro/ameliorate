import slugify from "@sindresorhus/slugify";
import dateFormat from "dateformat";
import { $ } from "execa";
import yargs from "yargs/yargs";

import { prisma } from "../src/api/prisma";

// generate up and down sql files, since prisma only generates up for you
// related issue: "Roll back the latest migration group" https://github.com/prisma/prisma/discussions/4617
const generateMigration = async () => {
  // e.g. tsx generateMigration.ts --name=create-user-table
  const argv = await yargs(process.argv.slice(2)).options({
    name: { type: "string", demandOption: true },
  }).argv;

  // Create shadow db - required for prisma diff based on migrations folder
  // executeUnsafe because SQL templating does not support templating database names
  const shadowDbName = "ameliorate_shadow";
  await prisma.$executeRawUnsafe(`DROP DATABASE IF EXISTS ${shadowDbName};`);
  await prisma.$executeRawUnsafe(`CREATE DATABASE ${shadowDbName};`);

  // Create down migration
  // @ts-expect-error idk, execa example usage is like this but ts doesn't like piping after command returns potentially undefined
  const { stdout: _downStdout } = await $`prisma migrate diff \
  --from-schema-datamodel src/db/schema.prisma \
  --to-migrations src/db/migrations \
  --shadow-database-url postgres://postgres:Demo99@localhost:33100/${shadowDbName} \
  --script`.pipeStdout("down.sql");
  console.log("created down.sql");

  // Create up migration
  // @ts-expect-error idk, execa example usage is like this but ts doesn't like piping after command returns potentially undefined
  const { stdout: _upStdout } = await $`prisma migrate diff \
  --from-migrations src/db/migrations \
  --to-schema-datamodel src/db/schema.prisma \
  --shadow-database-url postgres://postgres:Demo99@localhost:33100/${shadowDbName} \
  --script`.pipeStdout("migration.sql");
  console.log("created migration.sql (up)");

  // create migration directory the same way that prisma does, "[timestamp]_[migration_name]"
  // timestamp calcuation: https://github.com/prisma/prisma-engines/blob/e6267db1c1bc827b8eb87f644288c3cb0800ec89/schema-engine/connectors/schema-connector/src/migrations_directory.rs#L30
  // migration name calculation: https://github.com/prisma/prisma/blob/8e19c755484dd8bafcad6da12f03ae227543faf3/packages/migrate/src/utils/promptForMigrationName.ts#L16
  const timestamp = dateFormat(new Date(), "yyyymmddHHMMss");
  const migrationName = slugify(argv.name, { separator: "_" });
  const migrationDirectoryName = `${timestamp}_${migrationName}`;
  await $`mkdir src/db/migrations/${migrationDirectoryName}/`;

  // mv migrations into directory
  await $`mv down.sql src/db/migrations/${migrationDirectoryName}/down.sql`;
  await $`mv migration.sql src/db/migrations/${migrationDirectoryName}/migration.sql`;

  // Drop shadow db
  await prisma.$executeRawUnsafe(`DROP DATABASE ${shadowDbName};`);
};

// not sure how to use top-level await without messing with project config
generateMigration()
  .then(() => console.log("done running generate script"))
  .catch((error) => console.log("issues running generate script, error: \n", error));
