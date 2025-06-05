import { createNanoEvents } from "nanoevents";

import { Node } from "@/web/topic/utils/graph";
import { type ViewState } from "@/web/view/currentViewStore/store";

interface Events {
  addNode: (node: Node) => void;
  overwroteDiagramData: () => void;
  changedDiagramFilter: () => void;
  changedLayoutConfig: () => void;
  changedView: (newView: ViewState) => void;
  viewBasics: () => void;
  viewJustification: () => void;
  viewResearch: () => void;
  viewComments: () => void;
  partSelected: (partId: string | null) => void;
}

export const emitter = createNanoEvents<Events>();
