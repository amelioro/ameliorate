import { createNanoEvents } from "nanoevents";

import { Node } from "../topic/utils/diagram";

interface Events {
  addNode: (node: Node) => void;
}

export const emitter = createNanoEvents<Events>();
