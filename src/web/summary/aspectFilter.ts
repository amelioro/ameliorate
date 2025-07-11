import { getEdgeInfoCategory } from "@/common/edge";
import { getNodeInfoCategory } from "@/common/node";
import { getDirectedRelationDescription } from "@/web/topic/utils/edge";
import {
  Graph,
  Node,
  ancestors,
  descendants,
  findNodeOrThrow,
  splitNodesByDirectAndIndirect,
} from "@/web/topic/utils/graph";

// TODO: test this
export const getComponents = (summaryNode: Node, graph: Graph) => {
  const components = ancestors(summaryNode, graph, ["has"]);

  return splitNodesByDirectAndIndirect(summaryNode, graph, ["has"], components);
};

export const getSolutionBenefits = (summaryNode: Node, graph: Graph) => {
  const benefits = ancestors(summaryNode, graph, ["has", "creates"], ["creates"], ["benefit"]);

  return splitNodesByDirectAndIndirect(summaryNode, graph, ["creates"], benefits);
};

export const getAddressed = (summaryNode: Node, graph: Graph) => {
  const addressed = ancestors(summaryNode, graph, ["has", "creates"], ["addresses"]);

  return splitNodesByDirectAndIndirect(summaryNode, graph, ["addresses"], addressed);
};

// TODO: test this
export const getDetriments = (summaryNode: Node, graph: Graph) => {
  const detriments = ancestors(summaryNode, graph, ["has", "creates"], ["creates"], ["detriment"]);

  return splitNodesByDirectAndIndirect(summaryNode, graph, ["creates"], detriments);
};

// TODO: test this
export const getObstacles = (summaryNode: Node, graph: Graph) => {
  const directObstacles = descendants(summaryNode, graph, [], ["obstacleOf"]); // empty edgesToTraverse because we only want direct obstacles
  const directObstaclesIds = directObstacles.map((node) => node.id);

  const componentsAndDetriments = ancestors(summaryNode, graph, ["has", "creates"], undefined, [
    "solutionComponent",
    "detriment",
  ]);

  const indirectObstacles = componentsAndDetriments
    .flatMap((node) => descendants(node, graph, [], ["obstacleOf"]))
    .filter((node) => !directObstaclesIds.includes(node.id));

  return { directNodes: directObstacles, indirectNodes: indirectObstacles };
};

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
