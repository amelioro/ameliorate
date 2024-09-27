/* eslint-disable -- don't really care to make this file meet eslint standards, since store type is changing between each migration */

import {
  FromViewState1,
  renameStructureToBreakdown,
} from "@/common/tsMigrations/20240926155659_rename_structure_to_breakdown";

export const migrate = (persistedState: any, version: number) => {
  const migrations = [migrate_1_to_2];

  let state = persistedState;

  // thanks for this style to migrate one version at a time https://github.com/pmndrs/zustand/issues/984#issuecomment-1144661466
  migrations.forEach((migration, i) => {
    // i + 1 because these versions started from 1, not 0
    if (i + 1 >= version) {
      state = migration(state);
    }
  });

  return state;
};

export const migrate_1_to_2 = (state: FromViewState1) => {
  renameStructureToBreakdown(state);
};
