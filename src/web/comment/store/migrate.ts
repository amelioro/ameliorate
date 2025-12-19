/* eslint-disable -- don't really care to make this file meet eslint standards, since store type is changing between each migration */

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

interface FromState1 {
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

interface ToState2 {}

// remove topic state from this store; diagram store migration will handle putting it into topic store if we're on the playground (to preserve description)
const migrate_1_to_2 = (state: FromState1) => {
  const topic = state.topic;

  delete state.topic;

  return state as ToState2;
};
