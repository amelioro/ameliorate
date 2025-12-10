import { Node as FlowNode } from "@xyflow/react";
import { create } from "zustand";

interface ExternalFlowStoreState {
  getFlowDisplayedNodes: () => FlowNode[];
}

const initialState = {
  getFlowDisplayedNodes: () => [],
};

/**
 * Provides a way to access React Flow state from outside of the React Flow Provider.
 *
 * This is pretty jank, but want a way to get the displayed nodes for a diagram while being able to
 * put the button outside of the React Flow children tree (i.e. in the topic toolbar).
 */
const useExternalFlowStoreState = create<ExternalFlowStoreState>()(() => initialState);

export const setDisplayNodesGetter = (getter: () => FlowNode[]) => {
  useExternalFlowStoreState.setState({
    getFlowDisplayedNodes: getter,
  });
};

export const getDisplayNodes = () => {
  const state = useExternalFlowStoreState.getState();
  return state.getFlowDisplayedNodes();
};
