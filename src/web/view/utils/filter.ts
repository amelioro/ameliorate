import { z } from "zod";

import { exploreRelationNames } from "../../../common/edge";
import { NodeType, nodeSchema, zNodeTypes } from "../../../common/node";
import { Graph, Node, ancestors, descendants, getRelevantEdges } from "../../topic/utils/graph";
import { children, parents } from "../../topic/utils/node";

// general filter options
const generalSchema = z.object({
  nodeTypes: zNodeTypes.array(),
  showSecondaryNeighbors: z.boolean(),
});

// standard filters

// none filter
const noneSchema = z.object({
  type: z.literal("none"),
});

/**
 * Description:
 * - Show all recursive "causes" child relations from the central problem
 *
 * Use cases:
 * - Brainstorm causes
 */
const applyCausesFilter = (graph: Graph, filterOptions: CausesOptions) => {
  const centralProblem = graph.nodes.find((node) => node.id === filterOptions.centralProblemId);
  if (!centralProblem) return graph;

  const causes = descendants(centralProblem, graph, ["causes"]);

  const nodes = [centralProblem, ...causes];
  const edges = getRelevantEdges(nodes, graph);

  return { nodes, edges };
};

const causesSchema = z.object({
  type: z.literal("causes"),
  centralProblemId: nodeSchema.shape.id,
});

type CausesOptions = z.infer<typeof causesSchema>;

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
  const selectedSolutions = problemChildren.filter(
    (child) =>
      child.type === "solution" &&
      (filterOptions.solutions.length === 0 || filterOptions.solutions.includes(child.id))
  );
  const selectedCriteria = problemChildren.filter(
    (child) =>
      child.type === "criterion" &&
      (filterOptions.criteria.length === 0 || filterOptions.criteria.includes(child.id))
  );

  const criteriaParents = selectedCriteria.flatMap((criterion) =>
    // filter problem because we want to include the problem regardless of if we're showing criteria, for context
    parents(criterion, graph).filter((parent) => parent.type !== "problem")
  );

  const solutionDetails =
    filterOptions.detail === "none"
      ? []
      : selectedSolutions.flatMap((solution) => ancestors(solution, graph, ["has", "creates"]));

  const criteriaIds = selectedCriteria.map((criterion) => criterion.id);
  const filteredSolutionDetails =
    filterOptions.detail === "none"
      ? []
      : filterOptions.detail === "all"
      ? solutionDetails
      : solutionDetails.filter((detail) =>
          ancestors(detail, graph).some((ancestor) => criteriaIds.includes(ancestor.id))
        );

  const nodes = [
    centralProblem,
    ...selectedSolutions,
    ...selectedCriteria,
    ...criteriaParents,
    ...filteredSolutionDetails,
  ];
  const edges = getRelevantEdges(nodes, graph);

  return { nodes, edges };
};

const tradeoffsSchema = z.object({
  type: z.literal("tradeoffs"),
  centralProblemId: nodeSchema.shape.id,
  detail: z.union([z.literal("all"), z.literal("connectedToCriteria"), z.literal("none")]),
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

  const details = ancestors(centralSolution, graph, ["has", "creates"]);

  const nodes = [centralSolution, ...details];
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
  const exploreChildren = descendants(centralQuestion, graph, exploreRelationNames);

  const nodes = [centralQuestion, ...parentsForContext, ...exploreChildren];
  const edges = getRelevantEdges(nodes, graph);

  return { nodes, edges };
};

const questionSchema = z.object({
  type: z.literal("question"),
  centralQuestionId: nodeSchema.shape.id,
});

type QuestionOptions = z.infer<typeof questionSchema>;

// filter methods

// TODO?: is there a way to type-guarantee that these values come from the defined schemas?
export const topicFilterTypes = ["none", "causes", "tradeoffs", "solution"] as const;
export const exploreFilterTypes = ["none", "question"] as const;

const filterTypes = [...topicFilterTypes, ...exploreFilterTypes] as const;
export type FilterTypes = typeof filterTypes[number];

export const applyNodeTypeFilter = (nodes: Node[], nodeTypes: NodeType[]) => {
  return nodes.filter((node) => nodeTypes.includes(node.type));
};

export const applyStandardFilter = (graph: Graph, options: FilterOptions): Graph => {
  // TODO?: is there a way to use a Record<Type, ApplyMethod> rather than a big if-else?
  // while still maintaining that the applyMethod only accepts the correct options type
  if (options.type === "none") return graph;
  else if (options.type === "causes") return applyCausesFilter(graph, options);
  else if (options.type === "tradeoffs") return applyTradeoffsFilter(graph, options);
  else if (options.type === "solution") return applySolutionFilter(graph, options);
  else return applyQuestionFilter(graph, options);
};

export const filterOptionsSchema = z.discriminatedUnion("type", [
  generalSchema.merge(noneSchema),
  generalSchema.merge(causesSchema),
  generalSchema.merge(tradeoffsSchema),
  generalSchema.merge(solutionSchema),
  generalSchema.merge(questionSchema),
]);

export const filterSchemas = {
  none: noneSchema,
  causes: causesSchema,
  tradeoffs: tradeoffsSchema,
  solution: solutionSchema,
  question: questionSchema,
};

export type FilterOptions = z.infer<typeof filterOptionsSchema>;
