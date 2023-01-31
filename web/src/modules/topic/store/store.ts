import { useContext } from "react";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { HydrationContext } from "../../../pages/index";
import { Diagram, buildNode, filterHiddenComponents } from "../utils/diagram";
import { doesDiagramExist } from "./actions";
import { migrate } from "./migrate";

export const rootId = "root";

const initialDiagrams: Record<string, Diagram> = {
  [rootId]: {
    nodes: [buildNode({ id: "0", type: "problem", diagramId: rootId })],
    edges: [],
    type: "Problem",
  },
};

export interface DiagramStoreState {
  diagrams: Record<string, Diagram>;
  activeDiagramId: string;
  nextNodeId: number;
  nextEdgeId: number;
}

export const initialState = {
  diagrams: initialDiagrams,
  activeDiagramId: rootId,
  nextNodeId: 1, // 0 is taken by the initial node
  nextEdgeId: 0,
};

// create atomic selectors for usage outside of store/ dir
// this is only exported to allow actions to be extracted to a separate file
export const useDiagramStore = create<DiagramStoreState>()(
  persist(immer(devtools(() => initialState)), {
    name: "diagram-storage",
    version: 3,
    migrate: migrate,
  })
);

// create atomic selectors for usage outside of store/ dir
// this is only exported to allow hooks to be extracted to a separate file
export const useDiagramStoreAfterHydration = ((selector, compare) => {
  /*
  This a fix to ensure zustand never hydrates the store before React hydrates the page.
  Without this, there is a mismatch between SSR/SSG and client side on first draw which produces
  an error.
  Thanks https://github.com/pmndrs/zustand/issues/1145#issuecomment-1247061387
   */
  const store = useDiagramStore(selector, compare);

  // unfortunately, useEffect triggers on first render of every component using this,
  // so when the page has already been loaded, any new component will be rendered for the first time with
  // `initialState`. we should only be using the `initialState` for the first render of the _page_,
  // not of every component, so we need to move `useEffect` to the page component.
  const isHydrated = useContext(HydrationContext);

  return isHydrated ? store : selector(initialState);
}) as typeof useDiagramStore;

export const useActiveDiagramId = () => {
  return useDiagramStoreAfterHydration((state) => state.activeDiagramId);
};

export const useFilteredActiveDiagram = () => {
  return useDiagramStoreAfterHydration((state) =>
    filterHiddenComponents(state.diagrams[state.activeDiagramId])
  );
};

export const useDiagramType = (diagramId: string) => {
  return useDiagramStoreAfterHydration((state) => {
    // Zombie child issue, see https://github.com/pmndrs/zustand/issues/302
    // batchedUpdates isn't necessary because react already batches updates as of react 18
    // Batching doesn't fix this though because the error isn't when rendering, it's when checking the store's comparers
    if (!doesDiagramExist(diagramId)) return null;
    return state.diagrams[diagramId].type;
  });
};

export const useRootTitle = () => {
  return useDiagramStoreAfterHydration((state) => state.diagrams[rootId].nodes[0].data.label);
};

export const useClaimDiagramIdentifiers = () => {
  return useDiagramStoreAfterHydration((state) =>
    Object.entries(state.diagrams)
      .filter(([id, _]) => id !== rootId)
      .map(([id, diagram]) => [id, diagram.nodes[0].data.label])
  );
};

export const useDoesDiagramExist = (diagramId: string) => {
  return useDiagramStoreAfterHydration((state) => Object.keys(state.diagrams).includes(diagramId));
};
