import { Node as FlowNode } from "reactflow";
import { create } from "zustand";

import { DiagramType } from "../../../../common/diagram";

interface ExternalFlowStoreState {
  getFlowDisplayedNodes: Partial<Record<DiagramType, () => FlowNode[]>>;
}

const initialState = {
  getFlowDisplayedNodes: {},
};

/**
 * Provides a way to access React Flow state from outside of the React Flow Provider.
 *
 * This is pretty jank, but want a way to get the displayed nodes for a diagram while being able to
 * put the button outside of the React Flow children tree (i.e. in the topic toolbar).
 */
const useExternalFlowStoreState = create<ExternalFlowStoreState>()(() => initialState);

export const setDisplayNodesGetter = (diagramType: DiagramType, getter: () => FlowNode[]) => {
  const state = useExternalFlowStoreState.getState();

  useExternalFlowStoreState.setState({
    getFlowDisplayedNodes: { ...state.getFlowDisplayedNodes, [diagramType]: getter },
  });
};

export const getDisplayNodes = (diagramType: DiagramType) => {
  const state = useExternalFlowStoreState.getState();
  return state.getFlowDisplayedNodes[diagramType]?.();
};
