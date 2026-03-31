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

const migrate_1_to_2 = (state: any) => {
  // old banner text: "🚀 Looking for an easy way to help out? Pilot test Ameliorate!"
  // new banner text: "🧠 Want to discuss tools like Ameliorate? Join the Collaborative Reasoning Tech community Discord Server!"
  state.showBanner = true;

  return state;
};
