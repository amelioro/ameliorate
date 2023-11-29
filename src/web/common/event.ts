import { createNanoEvents } from "nanoevents";

import { Node } from "../topic/utils/diagram";

interface Events {
  addNode: (node: Node) => void;
  errored: () => void;
  loadedTopicData: () => void;
}

export const emitter = createNanoEvents<Events>();
