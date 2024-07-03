import { createNanoEvents } from "nanoevents";

import { Node } from "@/web/topic/utils/graph";
import { type ViewState } from "@/web/view/currentViewStore/store";

interface Events {
  addNode: (node: Node) => void;
  errored: () => void;
  overwroteTopicData: () => void;
  changedDiagramFilter: () => void;
  changedView: (newView: ViewState) => void;
  viewTopicDetails: () => void;
  nodeSelected: () => void;
}

export const emitter = createNanoEvents<Events>();
