/**
 * Middleware to enable store changes to update the database based on the resulting diffs.
 *
 * Most of this logic is copy-pasted to use for multiple stores. Ideally we'd have one reusable
 * store, but that'd require more effort, and it's uncertain if we'll replace this middleware in the
 * long-term with some CRDT approach for real-time syncing.
 */

import { StateCreator, StoreMutatorIdentifier } from "zustand";

import { buildApiSyncerError } from "@/web/common/components/Error/apiSyncerError";
import { showError } from "@/web/common/components/InfoDialog/infoEvents";
import { trpcHelper } from "@/web/common/trpc";
import { TopicStoreState, getTopic } from "@/web/topic/topicStore/store";
import { isPlaygroundTopic } from "@/web/topic/utils/topic";

const saveDiffs = (storeBefore: TopicStoreState, storeAfter: TopicStoreState) => {
  const oldTopic = storeBefore.topic;
  const newTopic = storeAfter.topic;
  if (isPlaygroundTopic(oldTopic) || isPlaygroundTopic(newTopic)) return;

  // Only use this syncer for changes to description, since it can be changed from the workspace and
  // may want to be included in undo/redo functionality.
  // Changes to other fields are handled by direct calls to the topic API, since they don't need undo/redo.
  const anyChanges = newTopic.description !== oldTopic.description;
  if (!anyChanges) return;

  const topicChange = { id: newTopic.id, description: newTopic.description };

  // not really necessary but easier to follow the pattern in other apiSyncers
  const changeLists = {
    topicChange: [topicChange],
  };

  trpcHelper.client.topic.update.mutate(topicChange).catch((e: unknown) => {
    showError("changesFailedToSave", buildApiSyncerError(changeLists, e));
    throw e;
  });
};

/**
 * Complex middleware typing because we want to add methods to allow pausing syncing, e.g. for when
 * loading a new topic.
 *
 * This way of typing a middleware store is extremely hard to read, sorry.
 * It feels like a lot of type names should be more specific.
 *
 * There's probably a better way, but this is the prescribed way as defined here https://github.com/pmndrs/zustand/blob/main/docs/guides/typescript.md#middleware-that-changes-the-store-type
 *
 * Also followed the examples:
 * - zundo https://github.com/charkour/zundo/blob/cec8ec46e928e8d454cf4caab62a68d3748ad2c4/src/index.ts#L16-L39
 * - persist https://github.com/pmndrs/zustand/blob/978205802972101aa90ad680acb0c04ec9931e4a/src/middleware/persist.ts#L352-L379
 *
 * We're being a little lazy and not 1-for-1 following the prescribed way because that would be more
 * effort, and it's uncertain if we'll keep this middleware long-term as opposed to some CRDT approach.
 */

interface ApiSyncerState {
  apiSyncer: {
    pause: () => void;
    resume: () => void;
  };
}

type ApiSyncer = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
  U = T,
>(
  create: StateCreator<T, [...Mps, ["apiSyncer", unknown]], Mcs>,
) => StateCreator<T, Mps, [["apiSyncer", U], ...Mcs]>;

declare module "zustand/vanilla" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- we don't need `A` for our state, but interface must match
  interface StoreMutators<S, A> {
    apiSyncer: Write<S, ApiSyncerState>;
  }
}

type Write<T, U> = Omit<T, keyof U> & U;

// use specific store's state instead of `T` because we're being lazy with typing for now
type ApiSyncerImpl = (create: StateCreator<TopicStoreState>) => StateCreator<TopicStoreState>;

// types taken from https://github.com/pmndrs/zustand/blob/main/docs/guides/typescript.md#middleware-that-doesnt-change-the-store-type
const apiSyncerImpl: ApiSyncerImpl = (create) => (set, get, api) => {
  // eslint-disable-next-line functional/no-let -- we mutate this variable to control if we should sync
  let syncing = true;

  // There's a `set` and `get` passed by the store to its methods,
  // and there's a `setState` and `getState` that is defined on the store separately.
  // We want our middleware to run if `setState` is called because our "no store actions" pattern
  // relies on `setState`, but we might as well override `set` too in case we ever want to use that.
  // Tried extracting the code into a reusable function, but that seemed hard to read, so we're just
  // duplicating it here.
  const apiSyncerSet: typeof set = (...args) => {
    const storeBefore = get();
    set(...args);
    const storeAfter = get();

    const currentTopic = getTopic();
    if (isPlaygroundTopic(currentTopic)) return;
    if (!syncing) return;

    saveDiffs(storeBefore, storeAfter);
  };

  const origSetState = api.setState;
  // eslint-disable-next-line functional/immutable-data, no-param-reassign -- mutation required https://github.com/pmndrs/zustand/issues/881#issuecomment-1076957006
  api.setState = (...args) => {
    const storeBefore = api.getState();
    origSetState(...args);
    const storeAfter = api.getState();

    const currentTopic = getTopic();
    if (isPlaygroundTopic(currentTopic)) return;
    if (!syncing) return;

    saveDiffs(storeBefore, storeAfter);
  };

  // add methods to pause and resume syncing
  // eslint-disable-next-line functional/immutable-data, no-param-reassign -- mutation required https://github.com/pmndrs/zustand/issues/881#issuecomment-1076957006
  (api as unknown as ApiSyncerState).apiSyncer = {
    pause: () => {
      syncing = false;
    },
    resume: () => {
      syncing = true;
    },
  };

  return create(apiSyncerSet, get, api);
};

export const apiSyncer = apiSyncerImpl as unknown as ApiSyncer;
