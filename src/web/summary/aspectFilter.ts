import { getEdgeInfoCategory } from "@/common/edge";
import { getNodeInfoCategory } from "@/common/node";
import { getDirectedRelationDescription } from "@/web/topic/utils/edge";
import { Graph, Node, findNodeOrThrow } from "@/web/topic/utils/graph";

export const getNeighborsByRelationDescription = (summaryNode: Node, graph: Graph) => {
  const nodeInfoCategory = getNodeInfoCategory(summaryNode.type);

  // parents
  const parentsWithRelationDescription = graph.edges
    .filter(
      (edge) =>
        edge.target === summaryNode.id && getEdgeInfoCategory(edge.label) === nodeInfoCategory,
    )
    .map((parentEdge) => {
      const parentNode = findNodeOrThrow(parentEdge.source, graph.nodes);
      return {
        node: parentNode,
        relationDescription: getDirectedRelationDescription({
          child: summaryNode.type,
          name: parentEdge.label,
          parent: parentNode.type,
          this: "child",
        }),
      };
    });

  const childrenWithRelationDescription = graph.edges
    .filter(
      (edge) =>
        edge.source === summaryNode.id && getEdgeInfoCategory(edge.label) === nodeInfoCategory,
    )
    .map((childEdge) => {
      const childNode = findNodeOrThrow(childEdge.target, graph.nodes);
      return {
        node: childNode,
        relationDescription: getDirectedRelationDescription({
          child: childNode.type,
          name: childEdge.label,
          parent: summaryNode.type,
          this: "parent",
        }),
      };
    });

  // arbitrarily put parents first, for consistency when iterating over these neighbors
  const neighbors = [...parentsWithRelationDescription, ...childrenWithRelationDescription];

  /* eslint-disable functional/immutable-data, no-param-reassign, functional/immutable-data -- seems easiest to do this mutably */
  const neighborsByRelationDescription = neighbors.reduce<Record<string, Node[]>>(
    (acc, { node, relationDescription }) => {
      if (acc[relationDescription] === undefined) acc[relationDescription] = [];
      acc[relationDescription].push(node);

      return acc;
    },
    {},
  );
  /* eslint-disable functional/immutable-data, no-param-reassign, functional/immutable-data */

  return neighborsByRelationDescription;
};
