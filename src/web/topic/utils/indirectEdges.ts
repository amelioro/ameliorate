import {
  AnyRelationName,
  CalculatedEdge,
  type CalculatedRelationType,
  MinimalEdge,
  causalTypes,
} from "@/common/edge";
import { MinimalGraph } from "@/common/graph";
import { MinimalNode, goodNodeTypes } from "@/common/node";

/**
 * An indirect edge is one between two nodes that aren't directly connected but have a path between
 * them that's being hidden by filters.
 *
 * Note: this is currently the only kind of `CalculatedEdge`, but we have separate types for these
 * because some places in code care about the fact that an indirect edge is calculated, and others
 * actually care that it's an indirect edge. Technically there may be other `CalculatedEdge`s in the
 * future, but it seems unlikely.
 *
 * Note: `id` format for indirect edges is `<sourceId>..<type>..<targetId>`.
 */
export type IndirectEdge = CalculatedEdge;

/**
 * Indirect edge ids follow the format `<sourceId>..<type>..<targetId>`.
 * Regular persisted edge ids don't contain `..`.
 */
export const isIndirectEdgeId = (id: string): boolean => {
  return id.includes("..");
};

export const isIndirectEdge = (edge: { id: string }): edge is CalculatedEdge => {
  return isIndirectEdgeId(edge.id);
};

const getIndirectEdgeId = (path: Path): string => {
  return `${path.startNode.id}..${path.combinedLabel}..${path.nextNode.id}`;
};

interface Path {
  edges: MinimalEdge[];
  startNode: MinimalNode;
  nextNode: MinimalNode;
  nodeIdsInPath: string[];
  combinedLabel: AnyRelationName;
  direction: "downstream" | "upstream";
}

const effectOf: Partial<Record<AnyRelationName, CalculatedRelationType>> = {
  addresses: "addressesEffectOf",
  mitigates: "mitigatesEffectOf",
  reduces: "reducesEffectOf",
  // `impedes` still seems to make sense without appending "effect of", e.g. "O impedes B, S causes B", hide B, "O impedes S"... seems like `impedes` implies that some _part_ is blocked
};

export const getIndirectEdges = (
  displayingDiagram: MinimalGraph,
  fullDiagram: MinimalGraph,
): IndirectEdge[] => {
  const displayingNodes = new Set(displayingDiagram.nodes.map((node) => node.id));
  const displayingEdges = new Set(displayingDiagram.edges.map((edge) => edge.id));
  const allNodesById = Object.fromEntries(fullDiagram.nodes.map((node) => [node.id, node]));

  const hiddenEdges = fullDiagram.edges.filter((edge) => !displayingEdges.has(edge.id));
  const { hiddenDownstreamEdgesByNodeId, hiddenUpstreamEdgesByNodeId } =
    buildHiddenEdgeMaps(hiddenEdges);

  // start by finding the hidden edges directly downstream of visible nodes
  const hiddenEdgesDownstreamOfVisibleNodes = displayingDiagram.nodes.flatMap((node) => {
    return (hiddenDownstreamEdgesByNodeId[node.id] ?? []).filter(
      (edge) => causalTypes[edge.type] !== "none", // no need to traverse `none` edges
    );
  });

  const hiddenPathsToExplore: Path[] = hiddenEdgesDownstreamOfVisibleNodes.map((edge) => ({
    edges: [edge],
    startNode: getNodeOrThrow(allNodesById, edge.sourceId),
    nextNode: getNodeOrThrow(allNodesById, edge.targetId),
    nodeIdsInPath: [edge.sourceId, edge.targetId],
    combinedLabel: edge.type,
    direction: "downstream",
  }));

  // keys are formatted as `${startNode.id}..${edgeType}..${nextNode.id}`
  const hiddenPathsBetweenVisibleNodePairs: Record<string, Path> = {};

  // explore each path until we find a visible node and then track it, or no visible node is found
  /* eslint-disable functional/no-let, functional/immutable-data, functional/no-loop-statements -- easier to traverse mutably */
  // TODO?: "dfs" not "bfs"? or actually use a bfs?
  let path: Path | undefined;
  while ((path = hiddenPathsToExplore.pop())) {
    // if nextNode is visible, stop and track the path; if not, keep exploring further down the path
    if (displayingNodes.has(path.nextNode.id)) {
      if (pathIsBetweenMutuallyExclusiveNodes(path)) continue;

      const normalizedPath = { ...path, combinedLabel: normalizePathLabel(path) };

      // we just need one of these paths per start-edgetype-end, so it's ok to overwrite any existing path here
      hiddenPathsBetweenVisibleNodePairs[getIndirectEdgeId(normalizedPath)] = normalizedPath;
    } else {
      const furtherPaths = getFurtherPathsToExplore(
        path,
        hiddenDownstreamEdgesByNodeId,
        hiddenUpstreamEdgesByNodeId,
        allNodesById,
      );
      hiddenPathsToExplore.push(...furtherPaths);
    }
  }
  /* eslint-enable functional/no-let, functional/immutable-data, functional/no-loop-statements */

  // convert paths between visible node pairs into indirect edges
  const indirectEdges: IndirectEdge[] = Object.entries(hiddenPathsBetweenVisibleNodePairs).map(
    ([key, path]) => ({
      id: key,
      sourceId: path.startNode.id,
      targetId: path.nextNode.id,
      type: path.combinedLabel,
      data: {
        hiddenPath: path.edges,
      },
    }),
  );

  return indirectEdges;
};

const getNodeOrThrow = (allNodesById: Record<string, MinimalNode>, nodeId: string): MinimalNode => {
  const node = allNodesById[nodeId];
  if (!node) {
    throw new Error(`Node with id ${nodeId} not found`);
  }
  return node;
};

/**
 * E.g. it doesn't make sense to say "solution reduces solution" when they aren't both intended to be implemented
 */
const pathIsBetweenMutuallyExclusiveNodes = (path: Path): boolean => {
  // TODO?: ideally this probably would also exclude e.g. a component that reduces a component of
  // another solution, but that seems less of a big deal and annoying to implement.
  return path.startNode.type === "solution" && path.nextNode.type === "solution";
};

/**
 * `addresses` doesn't make sense to point at a good node type, so we change these to `reduces`.
 *
 * Note: ideally it seems like this logic would fit in `combineLabels`, but if we continue
 * traversing past the good node type and we reach a bad node type, we want to retain the original
 * reduces-type label (e.g. `addresses`). So it seems easiest to just calculate this after
 * traversing.
 */
const normalizePathLabel = (path: Path): AnyRelationName => {
  if (goodNodeTypes.includes(path.nextNode.type)) {
    if (path.combinedLabel === "addresses") return "reduces";
    if (path.combinedLabel === "mitigates") return "reduces";
    // "<reduces> effect of" still makes sense pointing at a good node type because "effect of" implies we're not talking about the good node type directly
    // `impedes` still makes sense pointing at a good node type
  }

  return path.combinedLabel;
};

const buildHiddenEdgeMaps = (hiddenEdges: MinimalEdge[]) => {
  const hiddenDownstreamEdgesByNodeId: Record<string, MinimalEdge[]> = {};
  const hiddenUpstreamEdgesByNodeId: Record<string, MinimalEdge[]> = {};

  /* eslint-disable functional/immutable-data -- simpler to build maps mutably */
  hiddenEdges.forEach((edge) => {
    (hiddenDownstreamEdgesByNodeId[edge.sourceId] ??= []).push(edge);
    (hiddenUpstreamEdgesByNodeId[edge.targetId] ??= []).push(edge);
  });
  /* eslint-enable functional/immutable-data */

  return { hiddenDownstreamEdgesByNodeId, hiddenUpstreamEdgesByNodeId };
};

const getFurtherPathsToExplore = (
  path: Path,
  hiddenDownstreamEdgesByNodeId: Record<string, MinimalEdge[]>,
  hiddenUpstreamEdgesByNodeId: Record<string, MinimalEdge[]>,
  allNodesById: Record<string, MinimalNode>,
): Path[] => {
  // explore downstream
  const downstreamPaths: Path[] =
    path.direction === "downstream"
      ? (hiddenDownstreamEdgesByNodeId[path.nextNode.id] ?? [])
          .filter(
            (edge) =>
              causalTypes[edge.type] !== "none" && !path.nodeIdsInPath.includes(edge.targetId),
          )
          .map((edge) => ({
            edges: path.edges.concat(edge),
            startNode: path.startNode,
            nextNode: getNodeOrThrow(allNodesById, edge.targetId),
            nodeIdsInPath: path.nodeIdsInPath.concat(edge.targetId),
            combinedLabel: combineLabels(path.combinedLabel, edge.type),
            direction: "downstream",
          }))
      : [];

  // explore upstream `causes`
  const upstreamCausesPaths: Path[] =
    causalTypes[path.combinedLabel] === "reduces"
      ? (hiddenUpstreamEdgesByNodeId[path.nextNode.id] ?? [])
          .filter((edge) => edge.type === "causes" && !path.nodeIdsInPath.includes(edge.sourceId))
          .map((edge) => ({
            edges: path.edges.concat(edge),
            startNode: path.startNode,
            nextNode: getNodeOrThrow(allNodesById, edge.sourceId),
            nodeIdsInPath: path.nodeIdsInPath.concat(edge.sourceId),
            // If path was downstream, transform to "reduces effect of" so that the label is clearer.
            // We're also manually combining the label here (causes + reduces = reduces) because this
            // branch includes the possibility of combining upstream + upstream labels, and
            // `combineLabels` makes more sense limiting to upstream + downstream.
            combinedLabel:
              path.direction === "downstream"
                ? effectOf[path.combinedLabel] ?? path.combinedLabel
                : path.combinedLabel,
            direction: "upstream",
          }))
      : [];

  // explore upstream `has`
  const upstreamHasPaths: Path[] =
    causalTypes[path.combinedLabel] !== "has"
      ? (hiddenUpstreamEdgesByNodeId[path.nextNode.id] ?? [])
          .filter((edge) => edge.type === "has" && !path.nodeIdsInPath.includes(edge.sourceId))
          .map((edge) => ({
            edges: path.edges.concat(edge),
            startNode: path.startNode,
            nextNode: getNodeOrThrow(allNodesById, edge.sourceId),
            nodeIdsInPath: path.nodeIdsInPath.concat(edge.sourceId),
            // We're manually combining the label here (has + x = x) because this
            // branch includes the possibility of combining upstream + upstream labels, and
            // `combineLabels` makes more sense limiting to upstream + downstream.
            combinedLabel: path.combinedLabel, // "has" always gets overruled
            direction: "upstream",
          }))
      : [];

  return [...downstreamPaths, ...upstreamCausesPaths, ...upstreamHasPaths];
};

const combineLabels = (
  upstreamLabel: AnyRelationName,
  downstreamLabel: AnyRelationName,
): AnyRelationName => {
  const upstreamCausalType = causalTypes[upstreamLabel];
  const downstreamCausalType = causalTypes[downstreamLabel];

  if (upstreamCausalType === "none" || downstreamCausalType === "none") {
    throw new Error("can't combine 'none' labels"); // should be filtered out before this method
  }

  // "misc" (e.g. "relatesTo") always overpowers other edge types because it's too presumptuous to assume the opposite label is still meaningful
  if (upstreamCausalType === "misc") return upstreamLabel;
  if (downstreamCausalType === "misc") return downstreamLabel;

  // "has" always gets overpowered by other edge types because "has" implies that the target node is really just a part of the source node
  if (upstreamCausalType === "has") return downstreamLabel;
  if (downstreamCausalType === "has") return upstreamLabel;

  // combining justification prefixes "maybe" because claim wording is usually in relation to the parent, and therefore may not make sense in relation to grandparent
  // "supports" generally increases parent strength, resulting in maybe-same relation
  // "critiques" generally decreases parent strength, resulting in maybe-opposite relation
  if (upstreamCausalType === "supports") {
    if (downstreamCausalType === "critiques") return "maybeCritiques";
    else if (downstreamCausalType === "supports") return "maybeSupports";
    else throw new Error("can't combine justification label with non-justification label");
  }
  if (upstreamCausalType === "critiques") {
    if (downstreamCausalType === "supports") return "maybeCritiques";
    else if (downstreamCausalType === "critiques") return "maybeSupports";
    else throw new Error("can't combine justification label with non-justification label");
  }
  if (downstreamCausalType === "supports" || downstreamCausalType === "critiques") {
    throw new Error("can't combine justification label with non-justification label");
  }

  // only possibilities left for either type are "causes" and "reduces"
  if (upstreamCausalType === "causes") {
    if (downstreamCausalType === "reduces") return downstreamLabel;
    else return upstreamLabel;
  }

  // upstreamCausalType is "reduces"
  if (downstreamCausalType === "causes") return upstreamLabel;

  // both are "reduces"
  return "causes";
};
