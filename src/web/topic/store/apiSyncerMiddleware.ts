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

type ApiSyncer = <
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  create: StateCreator<TopicStoreState, Mps, Mcs>,
) => StateCreator<TopicStoreState, Mps, Mcs>;

type ApiSyncerImpl = (f: StateCreator<TopicStoreState>) => StateCreator<TopicStoreState>;

// types taken from https://github.com/pmndrs/zustand/blob/main/docs/guides/typescript.md#middleware-that-doesnt-change-the-store-type
const apiSyncerImpl: ApiSyncerImpl = (create) => (set, get, api) => {
  // There's a `set` and `get` passed by the store to its methods,
  // and there's a `setState` and `getState` that is defined on the store separately.
  // We want our middleware to run if `setState` is called because our "no store actions" pattern
  // relies on `setState`, but we might as well override `set` too in case we ever want to use that.
  // Tried extracting the code into a reusable function, but that seemed hard to read, so we're just
  // duplicating it here.
  const apiSyncerSet: typeof set = (args) => {
    const storeBefore = get();
    set(args);
    const storeAfter = get();

    // Probably cleaner to check store.persist.getOptions().name === storagePlaygroundName, but it's
    // annoying to figure out how to type the `store` param as a persist store,
    // or even cleaner to check that we're not doing a populate action... but for some reason
    // `set`'s third arg of action (from devtools middleware) is always undefined.
    if (isPlaygroundTopic(storeAfter.topic)) return;

    // any diff API changes should be for the same topic (specifically we don't want to delete previously-viewed topic data)
    if (storeBefore.topic.id !== storeAfter.topic.id) return;

    saveDiffs(storeBefore, storeAfter);
  };

  const origSetState = api.setState;
  // eslint-disable-next-line functional/immutable-data, no-param-reassign -- mutation required https://github.com/pmndrs/zustand/issues/881#issuecomment-1076957006
  api.setState = (args) => {
    const storeBefore = api.getState();
    origSetState(args);
    const storeAfter = api.getState();

    // Probably cleaner to check store.persist.getOptions().name === storagePlaygroundName, but it's
    // annoying to figure out how to type the `store` param as a persist store,
    // or even cleaner to check that we're not doing a populate action... but for some reason
    // `set`'s third arg of action (from devtools middleware) is always undefined.
    if (isPlaygroundTopic(storeAfter.topic)) return;

    // any diff API changes should be for the same topic (specifically we don't want to delete previously-viewed topic data)
    if (storeBefore.topic.id !== storeAfter.topic.id) return;

    saveDiffs(storeBefore, storeAfter);
  };

  return create(apiSyncerSet, get, api);
};

export const apiSyncer = apiSyncerImpl as unknown as ApiSyncer;
