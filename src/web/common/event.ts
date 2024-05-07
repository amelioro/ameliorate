import { createNanoEvents } from "nanoevents";

import { Node } from "../topic/utils/graph";
import { resetView } from "../view/currentViewStore/store";

interface Events {
  addNode: (node: Node) => void;
  errored: () => void;
  overwroteTopicData: () => void;
  changedDiagramFilter: () => void;
}

export const emitter = createNanoEvents<Events>();

// could go elsewhere but don't want to put into Diagram components because they usually aren't rendered before loading
emitter.on("overwroteTopicData", () => {
  resetView();
});
