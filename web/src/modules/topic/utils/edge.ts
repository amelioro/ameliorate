import { DiagramState, Node } from "./diagram";
import { claimNodeTypes, getRelation } from "./nodes";

export const isValidEdge = (diagram: DiagramState, parent: Node, child: Node) => {
  const relation = getRelation(parent.type, child.type);

  const existingEdge = diagram.edges.find((edge) => {
    return (
      (edge.source === parent.id && edge.target === child.id) ||
      (edge.source === child.id && edge.target === parent.id)
    );
  });

  if (parent.id === child.id) {
    console.log("cannot connect nodes: tried dragging node onto itself");
    return false;
  }

  if (existingEdge) {
    console.log("cannot connect nodes: tried dragging between already-connected nodes");
    return false;
  }

  if (claimNodeTypes.includes(parent.type)) {
    console.log("cannot connect nodes: claim diagram is a tree so claim nodes can't add parents");
    return false;
  }

  if (!relation) {
    console.log("cannot connect nodes: nodes don't form a valid relation");
    return false;
  }

  return true;
};
