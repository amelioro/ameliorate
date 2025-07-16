import { nodeTypes } from "@/common/node";

const summaries = ["topic", ...nodeTypes] as const;
export type Summary = (typeof summaries)[number];

// categories are used as tabs in the summary view
const categories = [
  "coreNodes",
  "components",
  "motivation",
  "solutionConcerns",
  "tradeoffs",
  "all",
] as const;
export type Category = (typeof categories)[number];

export const categoriesBySummary: Record<Summary, [Category, ...Category[]]> = {
  topic: ["coreNodes"],

  // breakdown
  cause: ["all"],
  problem: ["all"],
  criterion: ["all"],
  solutionComponent: ["components", "tradeoffs", "motivation", "solutionConcerns", "all"],
  benefit: ["all"],
  effect: ["all"],
  detriment: ["all"],
  // tradeoffs seems like it's pretty good actually, not sure if there's need to keep motivation and concerns separately
  solution: ["components", "tradeoffs", "motivation", "solutionConcerns", "all"],
  obstacle: ["all"],
  mitigationComponent: ["components", "tradeoffs", "motivation", "solutionConcerns", "all"],
  mitigation: ["components", "tradeoffs", "motivation", "solutionConcerns", "all"],

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
  "components",
  "benefits",
  "addressed",
  "detriments",
  "obstacles",
  "motivation",
  "solutionConcerns",
  "all",
] as const;

export type TopicAspect = (typeof topicAspects)[number];
export type NodeAspect = (typeof nodeAspects)[number];
export type Aspect = TopicAspect | NodeAspect;

export const aspectsByCategory: Record<Category, [Aspect, Aspect?]> = {
  coreNodes: ["coreNodes"],
  components: ["components"],
  motivation: ["benefits", "addressed"],
  solutionConcerns: ["detriments", "obstacles"],
  tradeoffs: ["motivation", "solutionConcerns"],
  all: ["all"],
};
