import { nodeTypes } from "@/common/node";

const summaries = ["topic", ...nodeTypes] as const;
export type Summary = (typeof summaries)[number];

// categories are used as tabs in the summary view
const categories = [
  "coreNodes",
  "all",
  // solution
  "components",
  "motivation",
  "solutionConcerns",
  "tradeoffs",
  // problem
  "problemConcerns",
  "solutions",
  // effects
  "causeAndEffect",
] as const;
export type Category = (typeof categories)[number];

export const categoriesBySummary: Record<Summary, [Category, ...Category[]]> = {
  topic: ["coreNodes"],

  // breakdown
  cause: ["causeAndEffect", "solutions", "all"],
  problem: ["problemConcerns", "solutions", "all"],
  criterion: ["all"],
  solutionComponent: ["components", "tradeoffs", "all"],
  benefit: ["causeAndEffect", "motivation", "all"],
  effect: ["causeAndEffect", "all"],
  detriment: ["causeAndEffect", "solutions", "all"],
  // tradeoffs seems like it's pretty good actually, not sure if there's need to keep motivation and concerns separately
  // solution: ["components", "tradeoffs", "motivation", "solutionConcerns", "all"],
  solution: ["components", "tradeoffs", "all"],
  obstacle: ["solutions", "all"],
  mitigationComponent: ["components", "tradeoffs", "all"],
  mitigation: ["components", "tradeoffs", "all"],

  // research
  question: ["all"],
  answer: ["all"],
  fact: ["all"],
  source: ["all"],

  // justification
  rootClaim: ["all"],
  support: ["all"],
  critique: ["all"],

  // generic
  custom: ["all"],
};

// aspects are used as columns with a summary view's tab
const topicAspects = ["coreNodes"] as const;
const nodeAspects = [
  "incoming",
  "outgoing",
  // solution
  "components",
  "addressed",
  "obstacles",
  "motivation",
  "solutionConcerns",
  // problem
  "solutions",
  // effect
  "benefits",
  "detriments",
  "effects",
  "causes",
] as const;

export type TopicAspect = (typeof topicAspects)[number];
export type NodeAspect = (typeof nodeAspects)[number];
export type Aspect = TopicAspect | NodeAspect;

export const aspectsByCategory: Record<Category, [Aspect, Aspect?]> = {
  coreNodes: ["coreNodes"],
  all: ["incoming", "outgoing"],
  // solution
  components: ["components"],
  motivation: ["benefits", "addressed"], // not currently in use - was used by solution but replaced by tradeoffs 'motivation' column - can remove but want to keep for a bit and see if it seems useful
  solutionConcerns: ["detriments", "obstacles"], // not currently in use - was used by solution but replaced by tradeoffs 'solutionConcerns' column - can remove but want to keep for a bit and see if it seems useful
  tradeoffs: ["motivation", "solutionConcerns"],
  // problem
  problemConcerns: ["causes", "detriments"],
  solutions: ["solutions"],
  // effect
  causeAndEffect: ["causes", "effects"],
};
