import { createNanoEvents } from "nanoevents";

import { Node } from "../topic/utils/graph";
import { type ViewState } from "../view/currentViewStore/store";

interface Events {
  addNode: (node: Node) => void;
  errored: () => void;
  overwroteTopicData: () => void;
  changedDiagramFilter: () => void;
  changedView: (newView: ViewState) => void;
}

export const emitter = createNanoEvents<Events>();
