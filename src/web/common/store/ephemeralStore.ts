/**
 * This store is for things that won't be used for very long, e.g. a node is added and state needs to track
 * that it's new until the node is rendered.
 *
 * It seems like there should be a better way to do this, but I'm not sure what that way is right now.
 */

import { create } from "zustand";

/**
 * Where the node is being rendered. One use case is e.g. knowing that a node was added from the diagram
 * so that only the node being rendered in the diagram is focused after add (as opposed to focusing
 * the node in the details pane).
 *
 * In hindsight, probably could just create a NodeContextProvider so that various components everywhere don't
 * have to pass this, but this works for now.
 */
export type NodeContext = "diagram" | "table" | "details";

interface EphemeralStoreState {
  newlyAddedNode: {
    nodeId: string;
    context: NodeContext;
  } | null;
}

const initialState: EphemeralStoreState = {
  newlyAddedNode: null,
};

const useEphemeralStore = create<EphemeralStoreState>()(() => initialState);

// actions
export const setNewlyAddedNode = (nodeId: string, context: NodeContext) => {
  useEphemeralStore.setState({ newlyAddedNode: { nodeId, context } });
};

export const clearNewlyAddedNode = () => {
  useEphemeralStore.setState({ newlyAddedNode: null });
};

// utils
export const isNodeNewlyAdded = (nodeId: string, context: NodeContext) => {
  const { newlyAddedNode } = useEphemeralStore.getState();
  if (!newlyAddedNode) return false;

  return newlyAddedNode.nodeId === nodeId && newlyAddedNode.context === context;
};
