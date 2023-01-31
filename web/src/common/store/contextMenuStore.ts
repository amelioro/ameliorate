import { type Node as FlowNode } from "reactflow";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface MenuPosition {
  top: number;
  left: number;
}

export interface Context {
  node: FlowNode;
}

export interface ContextMenuStoreState {
  // using undefined instead of null because Mui's Menu's anchorPosition prop is optional
  anchorPosition: MenuPosition | undefined;
  context: Context | undefined;
}

const initialState: ContextMenuStoreState = {
  anchorPosition: undefined,
  context: undefined,
};

export const useContextMenuStore = create<ContextMenuStoreState>()(devtools(() => initialState));

export const useAnchorPosition = () => useContextMenuStore((state) => state.anchorPosition);

export const useContextMenuContext = () => useContextMenuStore((state) => state.context);
