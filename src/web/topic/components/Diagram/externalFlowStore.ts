import { Node as FlowNode, GeneralHelpers } from "@xyflow/react";
import { create } from "zustand";

interface ExternalFlowStoreState {
  getFlowDisplayedNodes: () => FlowNode[];
  getNodesBounds: GeneralHelpers["getNodesBounds"];
}

const initialState = {
  getFlowDisplayedNodes: () => [],
  getNodesBounds: () => ({ width: 0, height: 0, x: 0, y: 0 }),
};

/**
 * Provides a way to access React Flow state from outside of the React Flow Provider.
 *
 * This is pretty jank, but want a way to get the displayed nodes for a diagram while being able to
 * put the button outside of the React Flow children tree (i.e. in the topic toolbar).
 */
const useExternalFlowStoreState = create<ExternalFlowStoreState>()(() => initialState);

export const setFlowMethods = (
  getNodes: () => FlowNode[],
  getNodesBounds: GeneralHelpers["getNodesBounds"],
) => {
  useExternalFlowStoreState.setState({
    getFlowDisplayedNodes: getNodes,
    getNodesBounds: getNodesBounds,
  });
};

export const getDisplayNodes = () => {
  const state = useExternalFlowStoreState.getState();
  return state.getFlowDisplayedNodes();
};

export const getNodesBounds = (...props: Parameters<GeneralHelpers["getNodesBounds"]>) => {
  const state = useExternalFlowStoreState.getState();
  return state.getNodesBounds(...props);
};
