import shortUUID from "short-uuid";
import { devtools, persist } from "zustand/middleware";
import { createWithEqualityFn } from "zustand/traditional";

import { Comment, CommentParentType, isThreadStarterComment } from "@/common/comment";
import { errorWithData } from "@/common/errorHandling";
import { withDefaults } from "@/common/object";
import { apiSyncer } from "@/web/comment/store/apiSyncerMiddleware";
import { storageWithDates } from "@/web/common/store/utils";
import { setIsTopicPaneOpen } from "@/web/topic/components/TopicPane/paneStore";
import { StoreTopic, UserTopic } from "@/web/topic/store/store";
import { setSelected } from "@/web/view/currentViewStore/store";

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
  apiSyncer(
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
      },
    ),
  ),

  // Using `createWithEqualityFn` so that we can do a diff in hooks that return new arrays/objects
  // so that we can avoid extra renders
  Object.is,
);

// hooks
export const useThreadStarterComments = (
  parentId: string | null,
  parentType: CommentParentType,
  showResolved: boolean,
) => {
  return useCommentStore((state) =>
    state.comments
      .filter(
        (comment) =>
          comment.parentId === parentId &&
          comment.parentType === parentType &&
          (showResolved || !comment.resolved),
      )
      .toSorted((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
  );
};

export const useThreadChildrenComments = (commentId: string) => {
  return useCommentStore((state) =>
    state.comments
      .filter((comment) => comment.parentId === commentId && comment.parentType === "comment")
      .toSorted((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
  );
};

export const useCommentCount = (
  parentId: string | null,
  parentType: CommentParentType,
  showResolved: boolean,
) => {
  return useCommentStore(
    (state) =>
      state.comments.filter(
        (comment) =>
          comment.parentId === parentId &&
          comment.parentType === parentType &&
          (showResolved || !comment.resolved),
      ).length,
  );
};

// actions
export const upsertComment = (
  authorName: string,
  parentId: string | null,
  parentType: CommentParentType,
  content: string,
  commentId?: string,
) => {
  const state = useCommentStore.getState();

  const existingComment = state.comments.find((comment) => comment.id === commentId);
  const contentUpdatedAt = new Date();

  const updatedComments = existingComment
    ? state.comments.map((comment) => {
        if (comment.id === existingComment.id) {
          return {
            ...comment,
            content,
            contentUpdatedAt,
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
        resolved: isThreadStarterComment(parentType) ? false : null,
        createdAt: contentUpdatedAt,
        contentUpdatedAt: contentUpdatedAt,
      });

  useCommentStore.setState({ comments: updatedComments }, false, "upsertComment");
};

export const deleteComment = (commentId: string) => {
  useCommentStore.setState(
    (state) => ({
      comments: state.comments.filter(
        (comment) =>
          comment.id !== commentId &&
          // delete children, if this is a thread-starter comment
          !(comment.parentId === commentId && comment.parentType === "comment"),
      ),
    }),
    false,
    "deleteComment",
  );
};

export const resolveComment = (commentId: string, resolved: boolean) => {
  useCommentStore.setState(
    (state) => ({
      comments: state.comments.map((comment) =>
        comment.id === commentId ? { ...comment, resolved } : comment,
      ),
    }),
    false,
    "resolveComment",
  );
};

export const loadCommentsFromApi = (topic: UserTopic, comments: StoreComment[]) => {
  const builtPersistedName = `${persistedNameBase}-user`;

  useCommentStore.persist.setOptions({ name: builtPersistedName });

  useCommentStore.setState(
    {
      // specify each field because we don't need to store extra data like createdAt etc.
      topic: {
        id: topic.id,
        creatorName: topic.creatorName,
        title: topic.title,
        description: topic.description,
      },
      // specify each field because we don't need to store extra data like topicId etc.
      comments: comments.map((comment) => ({
        id: comment.id,
        authorName: comment.authorName,
        parentId: comment.parentId,
        parentType: comment.parentType,
        content: comment.content,
        resolved: comment.resolved,
        createdAt: comment.createdAt,
        contentUpdatedAt: comment.contentUpdatedAt,
      })),
    },
    true,
    "loadCommentsFromApi",
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

export const viewComment = (commentId: string) => {
  const state = useCommentStore.getState();

  const comment = state.comments.find((comment) => comment.id === commentId);
  if (!comment) return;

  const threadStarterComment =
    comment.parentType === "comment"
      ? state.comments.find((c) => c.id === comment.parentId)
      : comment;
  if (!threadStarterComment)
    throw errorWithData("couldn't find thread-starter comment", comment.parentId, state.comments);

  const commentParentGraphPartId =
    threadStarterComment.parentType === "topic" ? null : threadStarterComment.parentId;

  setSelected(commentParentGraphPartId);
  setIsTopicPaneOpen(true);
};
