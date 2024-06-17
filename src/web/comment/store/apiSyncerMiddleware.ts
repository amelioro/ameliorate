import diff from "microdiff";
import { StateCreator, StoreMutatorIdentifier } from "zustand";

import { Comment } from "@/common/comment";
import { trpcClient } from "@/pages/_app.page";
import { CommentStoreState } from "@/web/comment/store/commentStore";
import { emitter } from "@/web/common/event";
import { isPlaygroundTopic } from "@/web/topic/store/utils";

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

const getApiComments = (topicId: number, store: CommentStoreState): Comment[] => {
  const comments: Comment[] = store.comments.map((comment) => ({
    ...comment,
    topicId,
  }));

  return comments;
};

const saveDiffs = (
  topicId: number,
  storeBefore: CommentStoreState,
  storeAfter: CommentStoreState,
) => {
  const apiBefore = getApiComments(topicId, storeBefore);
  const apiAfter = getApiComments(topicId, storeAfter);

  const [commentsToCreate, commentsToUpdate, commentsToDelete] = getCrudDiffs(
    apiBefore,
    apiAfter,
    (comment) => comment.id,
  );

  const anyChanges = [commentsToCreate, commentsToUpdate, commentsToDelete].some(
    (changes) => changes.length > 0,
  );
  if (!anyChanges) return;

  trpcClient.comment.handleChangesets
    .mutate({ topicId, commentsToCreate, commentsToUpdate, commentsToDelete })
    .catch((e: unknown) => {
      emitter.emit("errored");
      throw e;
    });
};

type ApiSyncer = <
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  create: StateCreator<CommentStoreState, Mps, Mcs>,
) => StateCreator<CommentStoreState, Mps, Mcs>;

type ApiSyncerImpl = (f: StateCreator<CommentStoreState>) => StateCreator<CommentStoreState>;

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

    saveDiffs(storeAfter.topic.id, storeBefore, storeAfter);
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

    saveDiffs(storeAfter.topic.id, storeBefore, storeAfter);
  };

  return create(apiSyncerSet, get, api);
};

export const apiSyncer = apiSyncerImpl as unknown as ApiSyncer;
