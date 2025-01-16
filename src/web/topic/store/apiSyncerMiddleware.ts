/**
 * Middleware to enable store changes to update the database based on the resulting diffs.
 *
 * Most of this logic is copy-pasted to use for multiple stores. Ideally we'd have one reusable
 * store, but that'd require more effort, and it's uncertain if we'll replace this middleware in the
 * long-term with some CRDT approach for real-time syncing.
 */

import diff from "microdiff";
import { StateCreator, StoreMutatorIdentifier } from "zustand";

import { trpcClient } from "@/pages/_app.page";
import { emitter } from "@/web/common/event";
import { TopicStoreState } from "@/web/topic/store/store";
import { isPlaygroundTopic } from "@/web/topic/store/utils";
import { convertToApi } from "@/web/topic/utils/apiConversion";

const getCrudDiffs = <T>(
  before: T[],
  after: T[],
  identifierFn: (element: T) => string,
): [T[], T[], T[]] => {
  // use keyed objects instead of array of objects because array diffs vary based on element ordering
  const keyedBefore = Object.fromEntries(before.map((item) => [identifierFn(item), item]));
  const keyedAfter = Object.fromEntries(after.map((item) => [identifierFn(item), item]));

  const diffs = diff(keyedBefore, keyedAfter);

  /* eslint-disable @typescript-eslint/no-non-null-assertion -- the diff library is supposed to
     output the path to the diff, and we know our objects being diff'd are only one path deep (no
     nesting), so the values at the path's key should be present */
  const created = diffs
    .filter((diff) => diff.type === "CREATE")
    .map((diff) => keyedAfter[diff.path[0]!]!);
  const updated = diffs
    .filter((diff) => diff.type === "CHANGE")
    .map((diff) => keyedAfter[diff.path[0]!]!);
  const deleted = diffs
    .filter((diff) => diff.type === "REMOVE")
    .map((diff) => keyedBefore[diff.path[0]!]!);
  /* eslint-enable @typescript-eslint/no-non-null-assertion */

  return [created, updated, deleted];
};

const saveDiffs = (storeBefore: TopicStoreState, storeAfter: TopicStoreState) => {
  if (isPlaygroundTopic(storeBefore.topic)) return;

  const newDescription =
    storeAfter.topic.description !== storeBefore.topic.description
      ? storeAfter.topic.description
      : undefined;

  const apiBefore = convertToApi(storeBefore);
  const apiAfter = convertToApi(storeAfter);

  const [nodesToCreate, nodesToUpdate, nodesToDelete] = getCrudDiffs(
    apiBefore.nodes,
    apiAfter.nodes,
    (node) => node.id,
  );

  const [edgesToCreate, edgesToUpdate, edgesToDelete] = getCrudDiffs(
    apiBefore.edges,
    apiAfter.edges,
    (edge) => edge.id,
  );

  const [scoresToCreate, scoresToUpdate, scoresToDelete] = getCrudDiffs(
    apiBefore.userScores,
    apiAfter.userScores,
    (score) => score.username.toString() + score.graphPartId,
  );

  const changeLists = {
    nodesToCreate,
    nodesToUpdate,
    nodesToDelete,
    edgesToCreate,
    edgesToUpdate,
    edgesToDelete,
    scoresToCreate,
    scoresToUpdate,
    scoresToDelete,
  };

  const anyChanges =
    Object.values(changeLists).some((changes) => changes.length > 0) ||
    newDescription !== undefined;
  if (!anyChanges) return;

  // TODO: is there a way to compress this data? when uploading a new topic, the payload appears to be 30% larger than the file being uploaded
  trpcClient.topic.setData
    .mutate({ topicId: storeBefore.topic.id, description: newDescription, ...changeLists })
    .catch((e: unknown) => {
      emitter.emit("errored");
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

    if (isPlaygroundTopic(storeAfter.topic)) return;
    if (!syncing) return;

    saveDiffs(storeBefore, storeAfter);
  };

  const origSetState = api.setState;
  // eslint-disable-next-line functional/immutable-data, no-param-reassign -- mutation required https://github.com/pmndrs/zustand/issues/881#issuecomment-1076957006
  api.setState = (...args) => {
    const storeBefore = api.getState();
    origSetState(...args);
    const storeAfter = api.getState();

    if (isPlaygroundTopic(storeAfter.topic)) return;
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
