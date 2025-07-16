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
  // effects
] as const;
export type Category = (typeof categories)[number];

export const categoriesBySummary: Record<Summary, [Category, ...Category[]]> = {
  topic: ["coreNodes"],

  // breakdown
  cause: ["problemConcerns", "all"],
  problem: ["problemConcerns", "all"],
  criterion: ["all"],
  solutionComponent: ["components", "tradeoffs", "all"],
  benefit: ["all"],
  effect: ["all"],
  detriment: ["problemConcerns", "all"],
  // tradeoffs seems like it's pretty good actually, not sure if there's need to keep motivation and concerns separately
  // solution: ["components", "tradeoffs", "motivation", "solutionConcerns", "all"],
  solution: ["components", "tradeoffs", "all"],
  obstacle: ["all"],
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
  "all",
  // solution
  "components",
  "addressed",
  "obstacles",
  "motivation",
  "solutionConcerns",
  // problem
  // effect
  "benefits",
  "detriments",
  "causes",
] as const;

export type TopicAspect = (typeof topicAspects)[number];
export type NodeAspect = (typeof nodeAspects)[number];
export type Aspect = TopicAspect | NodeAspect;

export const aspectsByCategory: Record<Category, [Aspect, Aspect?]> = {
  coreNodes: ["coreNodes"],
  all: ["all"],
  // solution
  components: ["components"],
  motivation: ["benefits", "addressed"],
  solutionConcerns: ["detriments", "obstacles"],
  tradeoffs: ["motivation", "solutionConcerns"],
  // problem
  problemConcerns: ["causes", "detriments"],
  // effect
};
