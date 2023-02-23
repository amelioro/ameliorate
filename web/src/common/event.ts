import { createNanoEvents } from "nanoevents";

import { Node } from "../modules/topic/utils/diagram";

interface Events {
  addNode: (node: Node) => void;
}

export const emitter = createNanoEvents<Events>();
