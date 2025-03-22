/**
 * Middleware to enable store changes to update the database based on the resulting diffs.
 *
 * Most of this logic is copy-pasted to use for multiple stores. Ideally we'd have one reusable
 * store, but that'd require more effort, and it's uncertain if we'll replace this middleware in the
 * long-term with some CRDT approach for real-time syncing.
 */

import diff from "microdiff";
import { StateCreator, StoreMutatorIdentifier } from "zustand";

import { QuickView } from "@/common/view";
import { trpcClient } from "@/pages/_app.page";
import { emitter } from "@/web/common/event";
import { isPlaygroundTopic } from "@/web/topic/store/utils";
import { QuickViewStoreState } from "@/web/view/quickViewStore/store";

const getCrudDiffs = <T extends object>(
  before: T[],
  after: T[],
  identifierFn: (element: T) => string,
): [T[], T[], T[]] => {
  // use keyed objects instead of array of objects because array diffs vary based on element ordering
  const keyedBefore = Object.fromEntries(before.map((item) => [identifierFn(item), item]));
  const keyedAfter = Object.fromEntries(after.map((item) => [identifierFn(item), item]));

  // Stringify nested paths because A.B -> A.B.C, A.B.C -> A.B.D, or A.B.C -> A.B should all be
  // calculated as an update to A, rather than (respectively) a create to A.B, an update to A.B,
  // or a delete to A.B.C.
  const stringifiedBefore = Object.fromEntries(
    Object.entries(keyedBefore).map(([key, value]) => [
      key,
      Object.fromEntries(Object.entries(value).map(([k, v]) => [k, JSON.stringify(v)])),
    ]),
  );
  const stringifiedAfter = Object.fromEntries(
    Object.entries(keyedAfter).map(([key, value]) => [
      key,
      Object.fromEntries(Object.entries(value).map(([k, v]) => [k, JSON.stringify(v)])),
    ]),
  );

  const diffs = diff(stringifiedBefore, stringifiedAfter);

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

const getApiViews = (topicId: number, store: QuickViewStoreState): QuickView[] => {
  const quickViews: QuickView[] = store.views.map((view) => ({
    ...view,
    viewState: view.viewState as unknown as Record<string, string>, // unknown cast is awkward but need until the viewState is shared with backend
    topicId,
  }));

  return quickViews;
};

const saveDiffs = (
  topicId: number,
  storeBefore: QuickViewStoreState,
  storeAfter: QuickViewStoreState,
) => {
  const apiBefore = getApiViews(topicId, storeBefore);
  const apiAfter = getApiViews(topicId, storeAfter);

  const [viewsToCreate, viewsToUpdate, viewsToDelete] = getCrudDiffs(
    apiBefore,
    apiAfter,
    (view) => view.id,
  );

  const anyChanges = [viewsToCreate, viewsToUpdate, viewsToDelete].some(
    (changes) => changes.length > 0,
  );
  if (!anyChanges) return;

  trpcClient.view.handleChangesets
    .mutate({ topicId, viewsToCreate, viewsToUpdate, viewsToDelete })
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
type ApiSyncerImpl = (
  create: StateCreator<QuickViewStoreState>,
) => StateCreator<QuickViewStoreState>;

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

    saveDiffs(storeAfter.topic.id, storeBefore, storeAfter);
  };

  const origSetState = api.setState;
  // eslint-disable-next-line functional/immutable-data, no-param-reassign -- mutation required https://github.com/pmndrs/zustand/issues/881#issuecomment-1076957006
  api.setState = (...args) => {
    const storeBefore = api.getState();
    origSetState(...args);
    const storeAfter = api.getState();

    if (isPlaygroundTopic(storeAfter.topic)) return;
    if (!syncing) return;

    saveDiffs(storeAfter.topic.id, storeBefore, storeAfter);
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
