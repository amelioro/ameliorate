import { uniqBy } from "es-toolkit";
import { z } from "zod";

import { RelationName, researchRelationNames } from "@/common/edge";
import { InfoCategory } from "@/common/infoCategory";
import { infoNodeTypes, nodeSchema } from "@/common/node";
import {
  Graph,
  Node,
  downstreamNodes,
  getRelevantEdges,
  upstreamNodes,
} from "@/web/topic/utils/graph";
import { neighbors, sourceNodes, targetNodes } from "@/web/topic/utils/node";

// cross-standard-filter options
const detailTypes = ["all", "connectedToCriteria", "none"] as const;
const zDetailTypes = z.enum(detailTypes);
export type DetailType = z.infer<typeof zDetailTypes>;

// none filter
const noneSchema = z.object({
  type: z.literal("none"),
});

/**
 * Description:
 * - Show each core node (problem & solution) along with X layers of nodes from them,
 * excluding criteria.
 *
 * Use cases:
 * - Give a quick overview of the topic
 */
const applyHighLevelFilter = (graph: Graph, filters: HighLevelOptions) => {
  const coreNodes = graph.nodes.filter((node) => ["problem", "solution"].includes(node.type));

  const details =
    filters.layersDeep === 0
      ? []
      : coreNodes
          .flatMap((coreNode) => neighbors(coreNode, graph, filters.layersDeep))
          .filter((node) => {
            return node.type !== "criterion";
          });

  const nodes = [...coreNodes, ...details];
  const edges = getRelevantEdges(nodes, graph);

  return { nodes, edges };
};

const highLevelSchema = z.object({
  type: z.literal("highLevel"),
  layersDeep: z.number().min(0).max(10), // 10 is an arbitrary max to prevent worrying about large recursions
});

type HighLevelOptions = z.infer<typeof highLevelSchema>;

/**
 * Description:
 * - Based on options, show recursive causes, effects, criteria, and/or solutions to the central problem
 *
 * Options:
 * - show causes (default true)
 * - show effects (default true)
 * - show criteria (default false)
 * - show solutions (default false)
 *
 * Use cases:
 * - Brainstorm causes
 * - Brainstorm effects
 * - Brainstorm criteria from causes/effects
 * - Brainstorm solutions
 */
const applyProblemFilter = (graph: Graph, filters: ProblemOptions) => {
  const centralProblem = graph.nodes.find((node) => node.id === filters.centralProblemId);
  if (!centralProblem) return graph;

  const upstreamDetailEdges: RelationName[] = [];
  const downstreamDetailEdges: RelationName[] = [];
  /* eslint-disable functional/immutable-data */
  if (filters.problemDetails.includes("causes")) upstreamDetailEdges.push("causes");
  if (filters.problemDetails.includes("effects")) downstreamDetailEdges.push("causes");
  if (filters.problemDetails.includes("subproblems")) downstreamDetailEdges.push("has");
  if (filters.problemDetails.includes("criteria")) upstreamDetailEdges.push("criterionFor");
  if (filters.problemDetails.includes("solutions")) {
    upstreamDetailEdges.push("addresses", "accomplishes");
  }
  /* eslint-enable functional/immutable-data */

  const upstreamProblemDetails = upstreamNodes(centralProblem, graph, upstreamDetailEdges);
  const downstreamProblemDetails = downstreamNodes(centralProblem, graph, downstreamDetailEdges);

  const solutions = upstreamProblemDetails.filter((detail) => detail.type === "solution");
  const criteria = upstreamProblemDetails.filter((detail) => detail.type === "criterion");
  const filteredSolutionDetails = getSolutionDetails(
    solutions,
    criteria,
    filters.solutionDetail,
    graph,
  );

  const problemDetails = [...upstreamProblemDetails, ...downstreamProblemDetails];
  const nodes = [centralProblem, ...problemDetails, ...filteredSolutionDetails];
  const edges = getRelevantEdges(nodes, graph);

  return { nodes, edges };
};

export const problemDetails = [
  "causes",
  "effects",
  "subproblems",
  "criteria",
  "solutions",
] as const;
const zProblemDetails = z.enum(problemDetails);
export type ProblemDetail = z.infer<typeof zProblemDetails>;

const problemSchema = z.object({
  type: z.literal("problem"),
  centralProblemId: nodeSchema.shape.id,
  problemDetails: zProblemDetails.array(),
  solutionDetail: zDetailTypes,
});

type ProblemOptions = z.infer<typeof problemSchema>;

/**
 * Description:
 * - Show selected criteria with all depth-1 related source nodes (causes, effects, benefits, detriments)
 * - Show selected solutions with all components, recursive effects, benefits, detriments
 *
 * Detail options:
 * - all: see description
 * - connectedToCriteria: for solutions, only show details that are connected to selected criteria
 * - none: for solutions, don't show details
 *
 * Use cases:
 * - Brainstorm solutions
 * - Compare solutions
 */
export const applyTradeoffsFilter = (graph: Graph, filters: TradeoffsOptions) => {
  const centralProblem = graph.nodes.find((node) => node.id === filters.centralProblemId);
  if (!centralProblem) return graph;

  const problemSources = sourceNodes(centralProblem, graph);
  const solutions = problemSources.filter((source) => source.type === "solution");
  const criteria = problemSources.filter((source) => source.type === "criterion");

  const { selectedSolutions, selectedCriteria } = getSelectedTradeoffNodes(
    solutions,
    criteria,
    filters,
  );

  const criteriaTargets = selectedCriteria.flatMap((criterion) =>
    // filter problem because we want to separately include the problem regardless of if we're showing criteria, for context
    targetNodes(criterion, graph).filter((target) => target.type !== "problem"),
  );

  const filteredSolutionDetails = getSolutionDetails(
    selectedSolutions,
    selectedCriteria,
    filters.solutionDetail,
    graph,
  );

  const nodes = uniqBy(
    [...selectedSolutions, ...selectedCriteria, ...criteriaTargets, ...filteredSolutionDetails],
    (node) => node.id,
  );
  const edges = getRelevantEdges(nodes, graph);

  return { nodes, edges };
};

const getSolutionDetails = (
  solutions: Node[],
  criteria: Node[],
  detailType: DetailType,
  graph: Graph,
) => {
  if (detailType === "none") return [];

  const downstreamDetails = solutions.flatMap((solution) =>
    downstreamNodes(solution, graph, ["has", "causes"]),
  );

  const upstreamDetails = solutions.flatMap((solution) =>
    upstreamNodes(solution, graph, ["impedes", "accomplishes", "contingencyFor"]),
  );

  const criteriaIds = criteria.map((criterion) => criterion.id);

  return detailType === "all"
    ? [...downstreamDetails, ...upstreamDetails]
    : downstreamDetails.filter((detail) =>
        downstreamNodes(detail, graph).some((downstreamNode) =>
          criteriaIds.includes(downstreamNode.id),
        ),
      );
};

/**
 * Return the selected solutions/criteria if they're valid.
 * If there are no valid solutions/criteria selected, return all solutions/criteria for the problem.
 */
export const getSelectedTradeoffNodes = (
  problemSolutions: Node[],
  problemCriteria: Node[],
  filters: { solutions: string[]; criteria: string[] },
) => {
  const selectedSolutions = problemSolutions.filter((solution) =>
    filters.solutions.includes(solution.id),
  );
  const selectedCriteria = problemCriteria.filter((criterion) =>
    filters.criteria.includes(criterion.id),
  );

  return {
    selectedSolutions: selectedSolutions.length === 0 ? problemSolutions : selectedSolutions,
    selectedCriteria: selectedCriteria.length === 0 ? problemCriteria : selectedCriteria,
  };
};

const tradeoffsSchema = z.object({
  type: z.literal("tradeoffs"),
  centralProblemId: nodeSchema.shape.id,
  solutionDetail: zDetailTypes,
  solutions: z.array(nodeSchema.shape.id),
  criteria: z.array(nodeSchema.shape.id),
});

export type TradeoffsOptions = z.infer<typeof tradeoffsSchema>;

/**
 * Description:
 * - Show solution with all of its details
 *
 * Use cases:
 * - Detail a solution
 */
export const applySolutionFilter = (graph: Graph, filters: SolutionOptions) => {
  const centralSolution = graph.nodes.find((node) => node.id === filters.centralSolutionId);
  if (!centralSolution) return graph;

  const solutionDetails = getSolutionDetails([centralSolution], [], "all", graph);

  const nodes = [centralSolution, ...solutionDetails];
  const edges = getRelevantEdges(nodes, graph);

  return { nodes, edges };
};

const solutionSchema = z.object({
  type: z.literal("solution"),
  centralSolutionId: nodeSchema.shape.id,
});

export type SolutionOptions = z.infer<typeof solutionSchema>;

/**
 * Description:
 * - Show question, depth-1 target nodes for context, all recursive upstream questions, answers, facts,
 * sources.
 *
 * Use cases:
 * - Explore a question
 */
const applyQuestionFilter = (graph: Graph, filters: QuestionOptions) => {
  const centralQuestion = graph.nodes.find((node) => node.id === filters.centralQuestionId);
  if (!centralQuestion) return graph;

  const targetsForContext = targetNodes(centralQuestion, graph, false);
  const researchUpstream = upstreamNodes(centralQuestion, graph, researchRelationNames);

  const nodes = [centralQuestion, ...targetsForContext, ...researchUpstream];
  const edges = getRelevantEdges(nodes, graph);

  return { nodes, edges };
};

const questionSchema = z.object({
  type: z.literal("question"),
  centralQuestionId: nodeSchema.shape.id,
});

type QuestionOptions = z.infer<typeof questionSchema>;

/**
 * Description:
 * - Show source and all nodes that it's relevant for.
 *
 * Use cases:
 * - Take notes on a source
 * - Understand what a source says
 */
const applySourceFilter = (graph: Graph, filters: SourceOptions) => {
  const centralSource = graph.nodes.find((node) => node.id === filters.centralSourceId);
  if (!centralSource) return graph;

  const details = downstreamNodes(centralSource, graph, [
    "sourceOf",
    "relevantFor",
    "mentions",
    "relatesTo",
  ]);

  const nodes = [centralSource, ...details];
  const edges = getRelevantEdges(nodes, graph);

  return { nodes, edges };
};

const sourceSchema = z.object({
  type: z.literal("source"),
  centralSourceId: nodeSchema.shape.id,
});

type SourceOptions = z.infer<typeof sourceSchema>;

/**
 * Description:
 * - Show root claim and all children that support or critique it.
 *
 * Use cases:
 * - Focus on justification for a specific score.
 */
const applyRootClaimFilter = (graph: Graph, filters: RootClaimOptions) => {
  const centralRootClaim = graph.nodes.find((node) => node.id === filters.centralRootClaimId);
  if (!centralRootClaim) return graph;

  const justification = upstreamNodes(centralRootClaim, graph, ["supports", "critiques"]);

  const nodes = [centralRootClaim, ...justification];
  const edges = getRelevantEdges(nodes, graph);

  return { nodes, edges };
};

const rootClaimSchema = z.object({
  type: z.literal("rootClaim"),
  centralRootClaimId: nodeSchema.shape.id,
});

type RootClaimOptions = z.infer<typeof rootClaimSchema>;

// filter methods
const standardFilterTypes = [
  "none",
  "highLevel",
  "problem",
  "tradeoffs",
  "solution",
  "question",
  "source",
  "rootClaim",
] as const;
const zStandardFilterTypes = z.enum(standardFilterTypes);
type StandardFilterType = z.infer<typeof zStandardFilterTypes>;

export const infoStandardFilterTypes: Record<InfoCategory, StandardFilterType[]> = {
  breakdown: ["none", "highLevel", "problem", "tradeoffs", "solution"],
  research: ["none", "question", "source"],
  justification: ["none", "rootClaim"],
};

export const applyStandardFilter = (graph: Graph, filter: StandardFilter): Graph => {
  // TODO?: is there a way to use a Record<Type, ApplyMethod> rather than a big if-else?
  // while still maintaining that the applyMethod only accepts the correct options type
  if (filter.type === "highLevel") return applyHighLevelFilter(graph, filter);
  else if (filter.type === "problem") return applyProblemFilter(graph, filter);
  else if (filter.type === "tradeoffs") return applyTradeoffsFilter(graph, filter);
  else if (filter.type === "solution") return applySolutionFilter(graph, filter);
  else if (filter.type === "question") return applyQuestionFilter(graph, filter);
  else if (filter.type === "source") return applySourceFilter(graph, filter);
  else if (filter.type === "rootClaim") return applyRootClaimFilter(graph, filter);
  else return graph;
};

/**
 * Show nodes for each information category whose toggle is on.
 * For each category, if it has a standard filter, its nodes are filtered by that.
 */
export const applyInfoFilter = (graph: Graph, infoFilter: InfoFilter) => {
  return Object.entries(infoFilter)
    .filter(([_, filter]) => filter.show)
    .flatMap(([category, filter]) => {
      const categoryNodes = graph.nodes.filter((node) =>
        infoNodeTypes[category as InfoCategory].includes(node.type),
      );

      if (filter.type === "none") return categoryNodes;

      const categoryEdges = getRelevantEdges(categoryNodes, graph);

      // If we ever want standard filters to be able to add nodes of other info categories, we could
      // consider passing all nodes to the filter + have invalid filters return no nodes +
      // return all nodes of the category if no filtered nodes are returned.
      const filteredCategoryNodes = applyStandardFilter(
        { nodes: categoryNodes, edges: categoryEdges },
        filter,
      ).nodes;

      return filteredCategoryNodes;
    });
};

export const standardFilterSchema = z.discriminatedUnion("type", [
  noneSchema,
  highLevelSchema,
  problemSchema,
  tradeoffsSchema,
  solutionSchema,
  questionSchema,
  sourceSchema,
  rootClaimSchema,
]);

// intentionally use spread operators instead of chaining `.merge(schema)` to avoid "type instantiation is excessively deep and possibly infinite" error
const standardFilterWithFallbacksSchema = z
  .object({
    ...noneSchema.shape,
    ...highLevelSchema.shape,
    ...problemSchema.shape,
    ...tradeoffsSchema.shape,
    ...solutionSchema.shape,
    ...questionSchema.shape,
    ...sourceSchema.shape,
    ...rootClaimSchema.shape,
    type: zStandardFilterTypes,
  })
  .deepPartial(); // all defaults should be optional to specify

export const standardFilterSchemasByType = {
  none: noneSchema,
  highLevel: highLevelSchema,
  problem: problemSchema,
  tradeoffs: tradeoffsSchema,
  solution: solutionSchema,
  question: questionSchema,
  source: sourceSchema,
  rootClaim: rootClaimSchema,
};

export type StandardFilter = z.infer<typeof standardFilterSchema>;
export type StandardFilterWithFallbacks = z.infer<typeof standardFilterWithFallbacksSchema>;
export type InfoFilter = Record<InfoCategory, StandardFilter & { show: boolean }>;
