import uniqBy from "lodash/uniqBy";
import { z } from "zod";

import { RelationName, researchRelationNames } from "../../../common/edge";
import { InfoCategory } from "../../../common/infoCategory";
import { infoNodeTypes, nodeSchema } from "../../../common/node";
import { Graph, Node, ancestors, descendants, getRelevantEdges } from "../../topic/utils/graph";
import { children, parents } from "../../topic/utils/node";

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
const applyHighLevelFilter = (graph: Graph, _filters: HighLevelOptions) => {
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
const applyProblemFilter = (graph: Graph, filters: ProblemOptions) => {
  const centralProblem = graph.nodes.find((node) => node.id === filters.centralProblemId);
  if (!centralProblem) return graph;

  const detailEdges: RelationName[] = [];
  /* eslint-disable functional/immutable-data */
  if (filters.problemDetails.includes("causes")) detailEdges.push("causes");
  if (filters.problemDetails.includes("effects")) detailEdges.push("createdBy");
  if (filters.problemDetails.includes("subproblems")) detailEdges.push("subproblemOf");
  if (filters.problemDetails.includes("criteria")) detailEdges.push("criterionFor");
  if (filters.problemDetails.includes("solutions")) detailEdges.push("addresses");
  /* eslint-enable functional/immutable-data */

  const problemDetails = descendants(centralProblem, graph, detailEdges);

  const solutions = problemDetails.filter((detail) => detail.type === "solution");
  const criteria = problemDetails.filter((detail) => detail.type === "criterion");
  const filteredSolutionDetails = getSolutionDetails(
    solutions,
    criteria,
    filters.solutionDetail,
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
const applyTradeoffsFilter = (graph: Graph, filters: TradeoffsOptions) => {
  const centralProblem = graph.nodes.find((node) => node.id === filters.centralProblemId);
  if (!centralProblem) return graph;

  const problemChildren = children(centralProblem, graph);
  const solutions = problemChildren.filter((child) => child.type === "solution");
  const criteria = problemChildren.filter((child) => child.type === "criterion");

  const { selectedSolutions, selectedCriteria } = getSelectedTradeoffNodes(
    solutions,
    criteria,
    filters
  );

  const criteriaParents = selectedCriteria.flatMap((criterion) =>
    // filter problem because we want to include the problem regardless of if we're showing criteria, for context
    parents(criterion, graph).filter((parent) => parent.type !== "problem")
  );

  const filteredSolutionDetails = getSolutionDetails(
    selectedSolutions,
    selectedCriteria,
    filters.solutionDetail,
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
  filters: { solutions: string[]; criteria: string[] }
) => {
  const selectedSolutions = problemSolutions.filter(
    (solution) => filters.solutions.length === 0 || filters.solutions.includes(solution.id)
  );
  const selectedCriteria = problemCriteria.filter(
    (criterion) => filters.criteria.length === 0 || filters.criteria.includes(criterion.id)
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
const applySolutionFilter = (graph: Graph, filters: SolutionOptions) => {
  const centralSolution = graph.nodes.find((node) => node.id === filters.centralSolutionId);
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
const applyQuestionFilter = (graph: Graph, filters: QuestionOptions) => {
  const centralQuestion = graph.nodes.find((node) => node.id === filters.centralQuestionId);
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
const applySourceFilter = (graph: Graph, filters: SourceOptions) => {
  const centralSource = graph.nodes.find((node) => node.id === filters.centralSourceId);
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

const diagramFilterTypes = [...topicFilterTypes, ...researchFilterTypes] as const;
export type DiagramFilterTypes = typeof diagramFilterTypes[number];

export const applyStandardFilter = (graph: Graph, filter: StandardFilter): Graph => {
  // TODO?: is there a way to use a Record<Type, ApplyMethod> rather than a big if-else?
  // while still maintaining that the applyMethod only accepts the correct options type
  if (filter.type === "none") return graph;
  else if (filter.type === "highLevel") return applyHighLevelFilter(graph, filter);
  else if (filter.type === "problem") return applyProblemFilter(graph, filter);
  else if (filter.type === "tradeoffs") return applyTradeoffsFilter(graph, filter);
  else if (filter.type === "solution") return applySolutionFilter(graph, filter);
  else if (filter.type === "question") return applyQuestionFilter(graph, filter);
  else return applySourceFilter(graph, filter);
};

export const applyDiagramFilter = (graph: Graph, diagramFilter: DiagramFilter) => {
  return Object.entries(diagramFilter)
    .filter(([_, filter]) => filter.show)
    .flatMap(([category, filter]) => {
      const categoryNodes = graph.nodes.filter((node) =>
        infoNodeTypes[category as InfoCategory].includes(node.type)
      );

      const filteredCategoryNodes = applyStandardFilter(
        { nodes: categoryNodes, edges: graph.edges },
        filter
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
]);

export const standardFilterSchemasByType = {
  none: noneSchema,
  highLevel: highLevelSchema,
  problem: problemSchema,
  tradeoffs: tradeoffsSchema,
  solution: solutionSchema,
  question: questionSchema,
  source: sourceSchema,
};

export type StandardFilter = z.infer<typeof standardFilterSchema>;
export type DiagramFilter = Record<InfoCategory, StandardFilter & { show: boolean }>;
