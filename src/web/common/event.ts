import { createNanoEvents } from "nanoevents";

import { Node } from "@/web/topic/utils/graph";
import { type ViewState } from "@/web/view/currentViewStore/store";

interface Events {
  addNode: (node: Node) => void;
  errored: () => void;
  overwroteTopicData: () => void;
  changedDiagramFilter: () => void;
  changedLayoutConfig: () => void;
  changedView: (newView: ViewState) => void;
  viewTopicDetails: () => void;
  partSelected: (partId: string | null) => void;
}

export const emitter = createNanoEvents<Events>();
