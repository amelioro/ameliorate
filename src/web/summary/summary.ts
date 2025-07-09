import { nodeTypes } from "@/common/node";

const summaries = ["topic", ...nodeTypes] as const;
export type Summary = (typeof summaries)[number];

// categories are used as tabs in the summary view
const categories = ["coreNodes", "components", "motivation", "concerns", "all"] as const;
export type Category = (typeof categories)[number];

export const categoriesBySummary: Record<Summary, [Category, ...Category[]]> = {
  topic: ["coreNodes"],

  // breakdown
  cause: ["all"],
  problem: ["all"],
  criterion: ["all"],
  solutionComponent: ["components", "motivation", "concerns", "all"],
  benefit: ["all"],
  effect: ["all"],
  detriment: ["all"],
  solution: ["components", "motivation", "concerns", "all"],
  obstacle: ["all"],
  mitigationComponent: ["components", "motivation", "concerns", "all"],
  mitigation: ["components", "motivation", "concerns", "all"],

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
  "all",
] as const;

export type TopicAspect = (typeof topicAspects)[number];
export type NodeAspect = (typeof nodeAspects)[number];
export type Aspect = TopicAspect | NodeAspect;

export const aspectsByCategory: Record<Category, [Aspect, Aspect?]> = {
  coreNodes: ["coreNodes"],
  components: ["components"],
  motivation: ["benefits", "addressed"],
  concerns: ["detriments", "obstacles"],
  all: ["all"],
};
