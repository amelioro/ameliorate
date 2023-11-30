import { createNanoEvents } from "nanoevents";

import { Node } from "../topic/utils/graph";

interface Events {
  addNode: (node: Node) => void;
  errored: () => void;
  loadedTopicData: () => void;
}

export const emitter = createNanoEvents<Events>();
