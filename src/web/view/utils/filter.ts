import uniqBy from "lodash/uniqBy";
import { z } from "zod";

import { RelationName, researchRelationNames } from "../../../common/edge";
import { NodeType, nodeSchema, zNodeTypes } from "../../../common/node";
import {
  Graph,
  GraphPart,
  Node,
  Score,
  ancestors,
  descendants,
  getRelevantEdges,
  possibleScores,
} from "../../topic/utils/graph";
import { children, parents } from "../../topic/utils/node";
import { getNumericScore } from "../../topic/utils/score";

// general filter options
export const scoredComparers = ["≥", ">", "≤", "<", "="] as const;
const zScoredComparers = z.enum(scoredComparers);
export type ScoredComparer = z.infer<typeof zScoredComparers>;

const generalSchema = z.object({
  nodeTypes: zNodeTypes.array(),
  showOnlyScored: z.boolean(),
  scoredComparer: zScoredComparers,
  scoreToCompare: z.enum(possibleScores),
  showSecondaryNeighbors: z.boolean(),
});

type GeneralOptions = z.infer<typeof generalSchema>;

// standard filters

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
 * - If there are problems, show each problems' immediate causes, effects, solutions
 * - Otherwise show whole diagram
 *
 * Use cases:
 * - Give a quick overview of the topic
 */
const applyHighLevelFilter = (graph: Graph, _filterOptions: HighLevelOptions) => {
  const problems = graph.nodes.filter((node) => node.type === "problem");
  if (problems.length === 0) return graph;

  const details = problems.flatMap((problem) =>
    children(problem, graph).filter((child) =>
      ["cause", "effect", "benefit", "detriment", "solution"].includes(child.type)
    )
  );

  const nodes = [...problems, ...details];
  const edges = getRelevantEdges(nodes, graph);

  return { nodes, edges };
};

const highLevelSchema = z.object({
  type: z.literal("highLevel"),
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
const applyProblemFilter = (graph: Graph, filterOptions: ProblemOptions) => {
  const centralProblem = graph.nodes.find((node) => node.id === filterOptions.centralProblemId);
  if (!centralProblem) return graph;

  const detailEdges: RelationName[] = [];
  /* eslint-disable functional/immutable-data */
  if (filterOptions.problemDetails.includes("causes")) detailEdges.push("causes");
  if (filterOptions.problemDetails.includes("effects")) detailEdges.push("createdBy");
  if (filterOptions.problemDetails.includes("subproblems")) detailEdges.push("subproblemOf");
  if (filterOptions.problemDetails.includes("criteria")) detailEdges.push("criterionFor");
  if (filterOptions.problemDetails.includes("solutions")) detailEdges.push("addresses");
  /* eslint-enable functional/immutable-data */

  const problemDetails = descendants(centralProblem, graph, detailEdges);

  const solutions = problemDetails.filter((detail) => detail.type === "solution");
  const criteria = problemDetails.filter((detail) => detail.type === "criterion");
  const filteredSolutionDetails = getSolutionDetails(
    solutions,
    criteria,
    filterOptions.solutionDetail,
    graph
  );

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
 * - Show problem
 * - Show selected criteria with all depth-1 related parents (causes, effects, benefits, detriments)
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
const applyTradeoffsFilter = (graph: Graph, filterOptions: TradeoffsOptions) => {
  const centralProblem = graph.nodes.find((node) => node.id === filterOptions.centralProblemId);
  if (!centralProblem) return graph;

  const problemChildren = children(centralProblem, graph);
  const solutions = problemChildren.filter((child) => child.type === "solution");
  const criteria = problemChildren.filter((child) => child.type === "criterion");

  const { selectedSolutions, selectedCriteria } = getSelectedTradeoffNodes(
    solutions,
    criteria,
    filterOptions
  );

  const criteriaParents = selectedCriteria.flatMap((criterion) =>
    // filter problem because we want to include the problem regardless of if we're showing criteria, for context
    parents(criterion, graph).filter((parent) => parent.type !== "problem")
  );

  const filteredSolutionDetails = getSolutionDetails(
    selectedSolutions,
    selectedCriteria,
    filterOptions.solutionDetail,
    graph
  );

  const nodes = uniqBy(
    [
      centralProblem,
      ...selectedSolutions,
      ...selectedCriteria,
      ...criteriaParents,
      ...filteredSolutionDetails,
    ],
    (node) => node.id
  );
  const edges = getRelevantEdges(nodes, graph);

  return { nodes, edges };
};

const getSolutionDetails = (
  solutions: Node[],
  criteria: Node[],
  detailType: DetailType,
  graph: Graph
) => {
  if (detailType === "none") return [];

  const solutionComponentsEffects = solutions.flatMap((solution) =>
    ancestors(solution, graph, ["has", "creates"])
  );

  const solutionObstacles = solutions.flatMap((solution) =>
    descendants(solution, graph, ["obstacleOf", "addresses"])
  );

  const criteriaIds = criteria.map((criterion) => criterion.id);

  return detailType === "all"
    ? [...solutionComponentsEffects, ...solutionObstacles]
    : solutionComponentsEffects.filter((detail) =>
        ancestors(detail, graph).some((ancestor) => criteriaIds.includes(ancestor.id))
      );
};

export const getSelectedTradeoffNodes = (
  problemSolutions: Node[],
  problemCriteria: Node[],
  filterOptions: TradeoffsOptions
) => {
  const selectedSolutions = problemSolutions.filter(
    (solution) =>
      filterOptions.solutions.length === 0 || filterOptions.solutions.includes(solution.id)
  );
  const selectedCriteria = problemCriteria.filter(
    (criterion) =>
      filterOptions.criteria.length === 0 || filterOptions.criteria.includes(criterion.id)
  );

  return { selectedSolutions, selectedCriteria };
};

const tradeoffsSchema = z.object({
  type: z.literal("tradeoffs"),
  centralProblemId: nodeSchema.shape.id,
  solutionDetail: zDetailTypes,
  solutions: z.array(nodeSchema.shape.id),
  criteria: z.array(nodeSchema.shape.id),
});

type TradeoffsOptions = z.infer<typeof tradeoffsSchema>;

/**
 * Description:
 * - Show solution with all components and effects
 *
 * Use cases:
 * - Detail a solution
 */
const applySolutionFilter = (graph: Graph, filterOptions: SolutionOptions) => {
  const centralSolution = graph.nodes.find((node) => node.id === filterOptions.centralSolutionId);
  if (!centralSolution) return graph;

  const ancestorDetails = ancestors(centralSolution, graph, ["has", "creates"]);
  const descendantDetails = descendants(centralSolution, graph, ["obstacleOf", "addresses"]);

  const nodes = [centralSolution, ...ancestorDetails, ...descendantDetails];
  const edges = getRelevantEdges(nodes, graph);

  return { nodes, edges };
};

const solutionSchema = z.object({
  type: z.literal("solution"),
  centralSolutionId: nodeSchema.shape.id,
});

type SolutionOptions = z.infer<typeof solutionSchema>;

/**
 * Description:
 * - Show question, depth-1 parents for context, all recursive child questions, answers, facts,
 * sources.
 *
 * Use cases:
 * - Explore a question
 */
const applyQuestionFilter = (graph: Graph, filterOptions: QuestionOptions) => {
  const centralQuestion = graph.nodes.find((node) => node.id === filterOptions.centralQuestionId);
  if (!centralQuestion) return graph;

  const parentsForContext = parents(centralQuestion, graph);
  const researchChildren = descendants(centralQuestion, graph, researchRelationNames);

  const nodes = [centralQuestion, ...parentsForContext, ...researchChildren];
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
 * - Show source and all ancestors that it's relevant for.
 *
 * Use cases:
 * - Take notes on a source
 * - Understand what a source says
 */
const applySourceFilter = (graph: Graph, filterOptions: SourceOptions) => {
  const centralSource = graph.nodes.find((node) => node.id === filterOptions.centralSourceId);
  if (!centralSource) return graph;

  const details = ancestors(centralSource, graph, [
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

// filter methods

// TODO?: is there a way to type-guarantee that these values come from the defined schemas?
export const topicFilterTypes = ["none", "highLevel", "problem", "tradeoffs", "solution"] as const;
export const researchFilterTypes = ["none", "question", "source"] as const;

const filterTypes = [...topicFilterTypes, ...researchFilterTypes] as const;
export type FilterTypes = typeof filterTypes[number];

export const applyNodeTypeFilter = (nodes: Node[], nodeTypes: NodeType[]) => {
  return nodes.filter((node) => nodeTypes.includes(node.type));
};

export const applyScoreFilter = <T extends GraphPart>(
  graphParts: T[],
  filterOptions: GeneralOptions,
  scores: Record<string, Score>
) => {
  const { showOnlyScored, scoredComparer, scoreToCompare } = filterOptions;
  if (!showOnlyScored) return graphParts;

  return graphParts.filter((graphPart) => {
    const score = scores[graphPart.id] ?? "-";
    if (scoredComparer === "=") return score === scoreToCompare;

    const numericScore = getNumericScore(score);
    const numericScoreToCompare = getNumericScore(scoreToCompare);

    if (scoredComparer === "≥") return numericScore >= numericScoreToCompare;
    if (scoredComparer === ">") return numericScore > numericScoreToCompare;
    if (scoredComparer === "≤") return numericScore <= numericScoreToCompare;
    return numericScore < numericScoreToCompare;
  });
};

export const applyStandardFilter = (graph: Graph, options: FilterOptions): Graph => {
  // TODO?: is there a way to use a Record<Type, ApplyMethod> rather than a big if-else?
  // while still maintaining that the applyMethod only accepts the correct options type
  if (options.type === "none") return graph;
  else if (options.type === "highLevel") return applyHighLevelFilter(graph, options);
  else if (options.type === "problem") return applyProblemFilter(graph, options);
  else if (options.type === "tradeoffs") return applyTradeoffsFilter(graph, options);
  else if (options.type === "solution") return applySolutionFilter(graph, options);
  else if (options.type === "question") return applyQuestionFilter(graph, options);
  else return applySourceFilter(graph, options);
};

export const filterOptionsSchema = z.discriminatedUnion("type", [
  generalSchema.merge(noneSchema),
  generalSchema.merge(highLevelSchema),
  generalSchema.merge(problemSchema),
  generalSchema.merge(tradeoffsSchema),
  generalSchema.merge(solutionSchema),
  generalSchema.merge(questionSchema),
  generalSchema.merge(sourceSchema),
]);

export const filterSchemas = {
  none: noneSchema,
  highLevel: highLevelSchema,
  problem: problemSchema,
  tradeoffs: tradeoffsSchema,
  solution: solutionSchema,
  question: questionSchema,
  source: sourceSchema,
};

export type FilterOptions = z.infer<typeof filterOptionsSchema>;
