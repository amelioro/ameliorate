import shortUUID from "short-uuid";
import { devtools, persist } from "zustand/middleware";
import { createWithEqualityFn } from "zustand/traditional";

import { Comment, CommentParentType, isRootComment } from "../../../common/comment";
import { withDefaults } from "../../../common/object";
import { storageWithDates } from "../../common/store/utils";
import { StoreTopic, UserTopic } from "../../topic/store/store";

export type StoreComment = Omit<Comment, "topicId">;

export interface CommentStoreState {
  /**
   * The page's current topic. This is a bit of a hack to give us a way to prevent api-syncing the comments when the topic changes.
   */
  topic: StoreTopic;
  comments: StoreComment[];
}

const initialState: CommentStoreState = {
  topic: { id: undefined, description: "" },
  comments: [],
};

const persistedNameBase = "commentStore";

const useCommentStore = createWithEqualityFn<CommentStoreState>()(
  persist(
    devtools(() => initialState, { name: persistedNameBase }),
    {
      name: persistedNameBase,
      version: 1,
      skipHydration: true,
      // don't merge persisted state with current state when rehydrating - instead, use the initialState to fill in missing values
      // e.g. so that a new non-null value in initialState is non-null in the persisted state,
      // removing the need to write a migration for every new field
      merge: (persistedState, _currentState) =>
        withDefaults(persistedState as Partial<CommentStoreState>, initialState),
      storage: storageWithDates,
    }
  ),

  // Using `createWithEqualityFn` so that we can do a diff in hooks that return new arrays/objects
  // so that we can avoid extra renders
  Object.is
);

// hooks
export const useRootComments = (
  parentId: string | null,
  parentType: CommentParentType,
  showResolved: boolean
) => {
  return useCommentStore((state) =>
    state.comments
      .filter(
        (comment) =>
          comment.parentId === parentId &&
          comment.parentType === parentType &&
          (showResolved || !comment.resolved)
      )
      .toSorted((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  );
};

export const useThreadChildrenComments = (commentId: string) => {
  return useCommentStore((state) =>
    state.comments
      .filter((comment) => comment.parentId === commentId && comment.parentType === "comment")
      .toSorted((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  );
};

// actions
export const upsertComment = (
  authorName: string,
  parentId: string | null,
  parentType: CommentParentType,
  content: string,
  commentId?: string
) => {
  const state = useCommentStore.getState();

  const existingComment = state.comments.find((comment) => comment.id === commentId);
  const updatedAt = new Date();

  const updatedComments = existingComment
    ? state.comments.map((comment) => {
        if (comment.id === existingComment.id) {
          return {
            ...comment,
            content,
            updatedAt,
          };
        } else {
          return comment;
        }
      })
    : state.comments.concat({
        id: shortUUID.generate(),
        authorName,
        parentId,
        parentType,
        content,
        resolved: isRootComment(parentType) ? false : null,
        createdAt: updatedAt,
        updatedAt: updatedAt,
      });

  useCommentStore.setState({ comments: updatedComments }, false, "upsertComment");
};

export const deleteComment = (commentId: string) => {
  useCommentStore.setState(
    (state) => ({
      comments: state.comments.filter(
        (comment) =>
          comment.id !== commentId &&
          // delete children, if this is a root commnt
          !(comment.parentId === commentId && comment.parentType === "comment")
      ),
    }),
    false,
    "deleteComment"
  );
};

export const resolveComment = (commentId: string, resolved: boolean) => {
  useCommentStore.setState(
    (state) => ({
      comments: state.comments.map((comment) =>
        comment.id === commentId ? { ...comment, resolved } : comment
      ),
    }),
    false,
    "resolveComment"
  );
};

export const loadCommentsFromLocalStorage = async () => {
  const builtPersistedName = `${persistedNameBase}-playground`;

  useCommentStore.persist.setOptions({ name: builtPersistedName });

  if (useCommentStore.persist.getOptions().storage?.getItem(builtPersistedName)) {
    // TODO(bug): for some reason, this results in an empty undo action _after_ clear() is run - despite awaiting this promise
    await useCommentStore.persist.rehydrate();
  } else {
    useCommentStore.setState(initialState, true, "loadCommentsFromLocalStorage");
  }
};
