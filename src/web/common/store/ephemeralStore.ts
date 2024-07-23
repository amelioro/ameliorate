/**
 * This store is for things that won't be used for very long, e.g. a node is added and state needs to track
 * that it's new until the node is rendered.
 *
 * It seems like there should be a better way to do this, but I'm not sure what that way is right now.
 */

import { create } from "zustand";

import { WorkspaceContextType } from "@/web/topic/components/TopicWorkspace/WorkspaceContext";

interface EphemeralStoreState {
  newlyAddedNode: {
    nodeId: string;
    context: WorkspaceContextType;
  } | null;
}

const initialState: EphemeralStoreState = {
  newlyAddedNode: null,
};

const useEphemeralStore = create<EphemeralStoreState>()(() => initialState);

// actions
export const setNewlyAddedNode = (nodeId: string, context: WorkspaceContextType) => {
  useEphemeralStore.setState({ newlyAddedNode: { nodeId, context } });
};

export const clearNewlyAddedNode = () => {
  useEphemeralStore.setState({ newlyAddedNode: null });
};

// utils
export const isNodeNewlyAdded = (nodeId: string, context: WorkspaceContextType) => {
  const { newlyAddedNode } = useEphemeralStore.getState();
  if (!newlyAddedNode) return false;

  return newlyAddedNode.nodeId === nodeId && newlyAddedNode.context === context;
};
