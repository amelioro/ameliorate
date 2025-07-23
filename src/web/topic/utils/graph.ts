import { uniqBy } from "es-toolkit";
import { v4 as uuid } from "uuid";

import { RelationName, justificationRelationNames, relationNames } from "@/common/edge";
import { errorWithData } from "@/common/errorHandling";
import { NodeType, infoNodeTypes, justificationNodeTypes, nodeTypes } from "@/common/node";
import { FlowNodeType } from "@/web/topic/utils/node";
import { GeneralFilter } from "@/web/view/utils/generalFilter";

export interface Graph {
  nodes: Node[];
  edges: Edge[];
}

export interface Node {
  id: string;
  data: {
    /**
     * Distinguished from `type` because this is explicitly open user input, and `type` can maintain stricter typing
     */
    customType: string | null;
    label: string;
    notes: string;
    arguedDiagramPartId?: string;
    showing: boolean;
  };
  type: FlowNodeType;
}

export interface ProblemNode extends Node {
  type: "problem";
}

interface BuildProps {
  id?: string;
  customType?: string | null;
  label?: string;
  notes?: string;
  type: FlowNodeType;
  arguedDiagramPartId?: string;
}
export const buildNode = ({
  id,
  customType = null,
  label,
  notes,
  type,
  arguedDiagramPartId,
}: BuildProps): Node => {
  const node = {
    id: id ?? uuid(),
    data: {
      customType: customType,
      label: label ?? `new node`,
      notes: notes ?? "",
      arguedDiagramPartId: justificationNodeTypes.includes(type) ? arguedDiagramPartId : undefined, // don't set arguedDiagramPartId on non-justifications because non-justifications shouldn't be deleted when the justification tree is deleted
      showing: true,
    },
    type: type,
  };

  return node;
};

export type RelationDirection = "parent" | "child";

export interface Edge {
  id: string;
  data: {
    /**
     * Distinguished from `label` because this is explicitly open user input, and `label` can maintain stricter typing
     */
    customLabel: string | null;
    notes: string;
    arguedDiagramPartId?: string;
  };
  label: RelationName;
  /**
   * id of the source graph part. Can be a node or an edge, but most UI edge operations only work
   * with node sources.
   *
   * It seems like there might be value in having a SuperEdge type that can point to edges, so that
   * regular edges can be distinguished. But that sounds like a lot of work and it's hard to tell
   * that it'd be worth it.
   */
  source: string; // source === parent if arrows point from bottom to top
  /**
   * id of the target graph part. Can be a node or an edge, but most UI edge operations only work
   * with node targets.
   *
   * It seems like there might be value in having a SuperEdge type that can point to edges, so that
   * regular edges can be distinguished. But that sounds like a lot of work and it's hard to tell
   * that it'd be worth it.
   */
  target: string; // target === child if arrows point from bottom to top
  type: "FlowEdge";
}

interface BuildEdgeProps {
  id?: string;
  customLabel?: string | null;
  notes?: string;
  sourceId: string;
  targetId: string;
  relation: RelationName;
  arguedDiagramPartId?: string;
}
export const buildEdge = ({
  id,
  customLabel = null,
  notes,
  sourceId,
  targetId,
  relation,
  arguedDiagramPartId,
}: BuildEdgeProps): Edge => {
  return {
    id: id ?? uuid(),
    data: {
      customLabel: customLabel,
      notes: notes ?? "",
      arguedDiagramPartId: justificationRelationNames.includes(relation)
        ? arguedDiagramPartId
        : undefined, // don't set arguedDiagramPartId on non-justifications because non-justifications shouldn't be deleted when the justification tree is deleted
    },
    label: relation,
    source: sourceId,
    target: targetId,
    type: "FlowEdge" as const,
  };
};

export type GraphPart = Node | Edge;
export type GraphPartType = "node" | "edge";

export const possibleScores = ["-", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;
export type Score = (typeof possibleScores)[number];

export const findNodeOrThrow = (nodeId: string, nodes: Node[]) => {
  const node = nodes.find((node) => node.id === nodeId);
  if (!node) throw errorWithData("node not found", nodeId, nodes);

  return node;
};

export const findEdgeOrThrow = (edgeId: string, edges: Edge[]) => {
  const edge = edges.find((edge) => edge.id === edgeId);
  if (!edge) throw errorWithData("edge not found", edgeId, edges);

  return edge;
};

export const findGraphPartOrThrow = (graphPartId: string, nodes: Node[], edges: Edge[]) => {
  const graphPart = [...nodes, ...edges].find((graphPart) => graphPart.id === graphPartId);
  if (!graphPart) throw errorWithData("graph part not found", graphPartId, nodes, edges);

  return graphPart;
};

export const isNode = (graphPart: GraphPart): graphPart is Node => {
  if (graphPart.type !== "FlowEdge") return true;
  return false;
};

export const isNodeType = <T extends NodeType>(
  graphPart: GraphPart,
  type: T,
): graphPart is Node & { type: T } => {
  return isNode(graphPart) && graphPart.type === type;
};

const findNodesRecursivelyFrom = (
  fromNode: Node,
  toDirection: RelationDirection,
  graph: Graph,
  labelsToTraverse: readonly RelationName[] = relationNames,
  labelsToKeep: readonly RelationName[] = labelsToTraverse, // if we don't have labelsToKeep, assume we want to narrow via labelsToTraverse (we don't generally want to keep nodes through all edge types, unless we're traversing all edge types)
  nodeTypesToKeep: readonly NodeType[] = nodeTypes,
  /**
   * track if we've seen the node already, so that we avoid infinite recursion if there's a cycle
   */
  seenIds: string[] = [fromNode.id],
  /**
   * track the current depth so that we can return nodes based on how far away they are.
   * for now we let other functions do what they want with the depth, but potentially this function
   * could accept a max depth and do the filtering itself.
   */
  depth = 1,
): (Node & {
  /**
   * how far away the node is from the `fromNode`. e.g. 1 if it's a direct neighbor, 2 if it's a neighbor's neighbor, etc.
   */
  layersAway: number;
})[] => {
  const from = toDirection === "child" ? "source" : "target";
  const to = toDirection === "child" ? "target" : "source";

  const foundEdges = {
    traverse: graph.edges.filter(
      (edge) =>
        edge[from] === fromNode.id &&
        labelsToTraverse.includes(edge.label) &&
        !seenIds.includes(edge[to]),
    ),
    keep: graph.edges.filter(
      (edge) =>
        edge[from] === fromNode.id &&
        labelsToKeep.includes(edge.label) &&
        !seenIds.includes(edge[to]),
    ),
  };

  const foundNodes = {
    traverse: foundEdges.traverse.map((edge) => findNodeOrThrow(edge[to], graph.nodes)),

    keep: foundEdges.keep
      .map((edge) => {
        const node = findNodeOrThrow(edge[to], graph.nodes);
        if (!nodeTypesToKeep.includes(node.type)) return null;
        return { ...node, layersAway: depth };
      })
      .filter((node) => node !== null),
  };

  if (foundNodes.traverse.length === 0) return foundNodes.keep;

  const seenIdsWithFound = seenIds.concat(foundNodes.traverse.map((node) => node.id));

  const furtherNodesToKeep = foundNodes.traverse.flatMap((node) =>
    // could update seenIds between furtherNode iterations here, but:
    // 1. not sure how to do that immutably
    // 2. the mutation makes it a bit harder to follow
    // 3. seems like cycles would be created during nested recursions, not sibling recursions,
    // and those should be prevented via seenIdsWithFound
    findNodesRecursivelyFrom(
      node,
      toDirection,
      graph,
      labelsToTraverse,
      labelsToKeep,
      nodeTypesToKeep,
      seenIdsWithFound,
      depth + 1,
    ),
  );

  return uniqBy(foundNodes.keep.concat(furtherNodesToKeep), (node) => node.id);
};

export const ancestors = (
  fromNode: Node,
  graph: Graph,
  labelsToTraverse?: RelationName[],
  labelsToKeep?: RelationName[],
  nodeTypesToKeep?: NodeType[],
) => {
  return findNodesRecursivelyFrom(
    fromNode,
    "parent",
    graph,
    labelsToTraverse,
    labelsToKeep,
    nodeTypesToKeep,
  );
};

export const descendants = (
  fromNode: Node,
  graph: Graph,
  labelsToTraverse?: RelationName[],
  labelsToKeep?: RelationName[],
  nodeTypesToKeep?: NodeType[],
) => {
  return findNodesRecursivelyFrom(
    fromNode,
    "child",
    graph,
    labelsToTraverse,
    labelsToKeep,
    nodeTypesToKeep,
  );
};

export const getRelevantEdges = (nodes: Node[], graph: Graph) => {
  const nodeIds = nodes.map((node) => node.id);

  return graph.edges.filter(
    (edge) => nodeIds.includes(edge.target) && nodeIds.includes(edge.source),
  );
};

/**
 * Secondary nodes are those that aren't the focus of the current diagram.
 *
 * For example, question and fact nodes are secondary in the topic diagram, and problem and solution
 * nodes are secondary in the research diagram.
 */
export const getSecondaryNeighbors = (
  primaryNodes: Node[],
  graph: Graph,
  generalFilter: GeneralFilter,
) => {
  const primaryNodeIds = primaryNodes.map((node) => node.id);

  const secondaryNeighbors = [];

  if (generalFilter.showSecondaryResearch) {
    const primaryNonResearchIds = primaryNodes
      .filter((node) => !infoNodeTypes.research.includes(node.type))
      .map((node) => node.id);

    const secondaryResearch = graph.nodes.filter(
      (node) =>
        !primaryNodeIds.includes(node.id) &&
        infoNodeTypes.research.includes(node.type) &&
        graph.edges.some(
          (edge) =>
            (edge.source === node.id && primaryNonResearchIds.includes(edge.target)) ||
            (edge.target === node.id && primaryNonResearchIds.includes(edge.source)),
        ),
    );

    // eslint-disable-next-line functional/immutable-data
    secondaryNeighbors.push(...secondaryResearch);
  }

  if (generalFilter.showSecondaryBreakdown) {
    const primaryNonBreakdownIds = primaryNodes
      .filter((node) => !infoNodeTypes.breakdown.includes(node.type))
      .map((node) => node.id);

    const secondaryBreakdown = graph.nodes.filter(
      (node) =>
        !primaryNodeIds.includes(node.id) &&
        infoNodeTypes.breakdown.includes(node.type) &&
        graph.edges.some(
          (edge) =>
            (edge.source === node.id && primaryNonBreakdownIds.includes(edge.target)) ||
            (edge.target === node.id && primaryNonBreakdownIds.includes(edge.source)),
        ),
    );

    // eslint-disable-next-line functional/immutable-data
    secondaryNeighbors.push(...secondaryBreakdown);
  }

  return secondaryNeighbors;
};

/**
 * Relies on `layersAway` to identify which nodes are direct.
 *
 * Also sorts indirect nodes by how far away they are, for convenience.
 */
export const splitNodesByDirectAndIndirect = (nodes: (Node & { layersAway: number })[]) => {
  return {
    directNodes: nodes.filter((node) => node.layersAway === 1),
    indirectNodes: nodes
      .filter((node) => node.layersAway > 1)
      .sort((node1, node2) => node1.layersAway - node2.layersAway),
  };
};
