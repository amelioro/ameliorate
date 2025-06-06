/**
 * Persist drafts so that users don't lose unsent comments when they navigate away.
 */

import { devtools, persist } from "zustand/middleware";
import { createWithEqualityFn } from "zustand/traditional";

import { CommentParentType } from "@/common/comment";
import { withDefaults } from "@/common/object";
import { storageWithDates } from "@/web/common/store/utils";

interface Draft {
  /**
   * There's only one draft possible per commenting textbox you see in the UI - in other words, there's
   * only one draft possible per thread, node, or edge. For this reason, we store drafts by thread/node/edge ("parent")
   * ID instead of a draft ID.
   */
  parentId: string | null;
  parentType: CommentParentType;
  content: string;
  /**
   * Only present if the draft is for editing an existing comment - this id is that comment's id,
   * and is needed to distinguish from a draft in the same thread that isn't for editing an existing
   * comment.
   */
  commentId?: string;
}

export interface DraftStoreState {
  drafts: Draft[];
}

const initialState: DraftStoreState = {
  drafts: [],
};

const persistedNameBase = "draftStore";

const useDraftStore = createWithEqualityFn<DraftStoreState>()(
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
        withDefaults(persistedState as Partial<DraftStoreState>, initialState),
      storage: storageWithDates,
    },
  ),

  // Using `createWithEqualityFn` so that we can do a diff in hooks that return new arrays/objects
  // so that we can avoid extra renders
  Object.is,
);

// hooks
export const useDraft = (
  parentId: string | null,
  parentType: CommentParentType,
  commentId?: string,
) => {
  return useDraftStore((state) =>
    state.drafts.find(
      (draft) =>
        draft.parentId === parentId &&
        draft.parentType === parentType &&
        draft.commentId === commentId,
    ),
  );
};

// actions
export const setDraft = (
  parentId: string | null,
  parentType: CommentParentType,
  content: string,
  commentId?: string,
) => {
  useDraftStore.setState(
    (state) => ({
      drafts: state.drafts
        .filter(
          (draft) =>
            !(
              draft.parentId === parentId &&
              draft.parentType === parentType &&
              draft.commentId === commentId
            ),
        )
        .concat({ parentId, parentType, content, commentId }),
    }),
    true,
    "setDraft",
  );
};

export const deleteDraft = (
  parentId: string | null,
  parentType: CommentParentType,
  commentId?: string,
) => {
  useDraftStore.setState(
    (state) => ({
      drafts: state.drafts.filter(
        (draft) =>
          !(
            draft.parentId === parentId &&
            draft.parentType === parentType &&
            draft.commentId === commentId
          ),
      ),
    }),
    true,
    "deleteDraft",
  );
};

export const loadDraftsFromLocalStorage = async (topicName?: string) => {
  const builtPersistedName = `${persistedNameBase}-${topicName ?? "playground"}`;

  useDraftStore.persist.setOptions({ name: builtPersistedName });

  if (useDraftStore.persist.getOptions().storage?.getItem(builtPersistedName)) {
    // TODO(bug): for some reason, this results in an empty undo action _after_ clear() is run - despite awaiting this promise
    await useDraftStore.persist.rehydrate();
  } else {
    useDraftStore.setState(initialState, true, "loadDraftsFromLocalStorage");
  }
};
