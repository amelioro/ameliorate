// jank manual way of running data migrations via typescript; run this with `npx tsx [path to this]`.
// seems like this would ideally fit in a `before.ts`/`after.ts` alongside regular sql migrations,
// but that hasn't been implemented for prisma yet - see https://github.com/prisma/prisma/issues/4688

import {
  FromViewState1,
  renameStructureToBreakdown,
} from "@/common/tsMigrations/20240926155659_rename_structure_to_breakdown";
import { xprisma } from "@/db/extendedPrisma";

// following code example from https://www.prisma.io/docs/orm/prisma-migrate/workflows/data-migration#create-a-data-migration-file
async function main() {
  await xprisma.$transaction(async (tx) => {
    const views = await tx.view.findMany();

    // eslint-disable-next-line functional/no-loop-statements
    for (const view of views) {
      renameStructureToBreakdown(view.viewState as unknown as FromViewState1);

      // this could be long if there are a ton of view records, but at this point in time, there aren't that many (~150), so not worth optimizing
      await tx.view.update({
        where: { id: view.id },
        data: {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          viewState: view.viewState!,
        },
      });
    }
  });
}

// not sure how to use top-level await without messing with project config
main()
  .then(() => console.log("done running data migration"))
  .catch((error: unknown) => console.log("issues running data migration, error: \n", error));
