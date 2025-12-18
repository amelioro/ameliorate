/* eslint-disable -- don't really care to make this file meet eslint standards, since store type is changing between each migration */

import {
  FromViewState1,
  renameStructureToBreakdown,
  ToViewState2,
} from "@/common/tsMigrations/20240926155659_rename_structure_to_breakdown";

export const migrate = (persistedState: any, version: number) => {
  const migrations = [migrate_1_to_2, migrate_2_to_3];

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

interface FromState1 {
  views: {
    viewState: FromViewState1;
  }[];
}

interface ToState2 {
  views: {
    viewState: ToViewState2;
  }[];
}

// rename structure -> breakdown
const migrate_1_to_2 = (state: FromState1) => {
  state.views.forEach((view) => {
    renameStructureToBreakdown(view.viewState);
  });

  return state;
};

interface FromState2 {
  topic?:
    | {
        id: undefined;
        description: string;
      }
    | {
        id: number;
        title: string;
        creatorName: string;
        description: string;
        visibility: "private" | "public" | "unlisted";
        allowAnyoneToEdit: boolean;
        createdAt: Date;
        updatedAt: Date;
      };
}

interface ToState3 {}

// remove topic state from this store; diagram store migration will handle putting it into topic store if we're on the playground (to preserve description)
const migrate_2_to_3 = (state: FromState2) => {
  const topic = state.topic;

  delete state.topic;

  return state as ToState3;
};
