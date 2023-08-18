import { createNanoEvents } from "nanoevents";

import { Diagram, Node } from "../topic/utils/diagram";

interface Events {
  addNode: (node: Node) => void;
  loadedTopicData: (diagram: Diagram) => void;
}

export const emitter = createNanoEvents<Events>();
