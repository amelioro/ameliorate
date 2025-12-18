import { uniqBy } from "es-toolkit";

import { NodeType, nodeTypes } from "@/common/node";

const _summaries = ["topic", ...nodeTypes] as const;
export type Summary = (typeof _summaries)[number];

// categories are used as tabs in the summary view
const _categories = [
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
  // research / justification
  "nuance",
  "isAbout",
] as const;
export type Category = (typeof _categories)[number];

export const categoriesBySummary: Record<Summary, [Category, ...Category[]]> = {
  topic: ["coreNodes"],

  // breakdown
  cause: ["causeAndEffect", "solutions", "nuance", "all"],
  problem: ["problemConcerns", "solutions", "nuance", "all"],
  criterion: ["nuance", "all"],
  solutionComponent: ["components", "tradeoffs", "nuance", "all"],
  benefit: ["causeAndEffect", "motivation", "nuance", "all"],
  effect: ["causeAndEffect", "nuance", "all"],
  detriment: ["causeAndEffect", "solutions", "nuance", "all"],
  // tradeoffs seems like it's pretty good actually, not sure if there's need to keep motivation and concerns separately
  // solution: ["components", "tradeoffs", "motivation", "solutionConcerns", "all"],
  solution: ["components", "tradeoffs", "nuance", "all"],
  obstacle: ["solutions", "nuance", "all"],
  mitigationComponent: ["components", "tradeoffs", "nuance", "all"],
  mitigation: ["components", "tradeoffs", "nuance", "all"],

  // research
  question: ["isAbout", "nuance", "all"],
  answer: ["isAbout", "nuance", "all"],
  fact: ["isAbout", "nuance", "all"],
  source: ["isAbout", "nuance", "all"],

  // justification
  rootClaim: ["isAbout", "nuance", "all"],
  support: ["isAbout", "nuance", "all"],
  critique: ["isAbout", "nuance", "all"],

  // generic
  custom: ["nuance", "all"],
};

// aspects are used as columns with a summary view's tab
const _topicAspects = ["coreNodes"] as const;
const _nodeAspects = [
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
  // research / justification
  "justification",
  "research",
  "isAbout",
] as const;

export type TopicAspect = (typeof _topicAspects)[number];
export type NodeAspect = (typeof _nodeAspects)[number];
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
  // research / justification
  nuance: ["justification", "research"],
  isAbout: ["isAbout"],
};

export const getAspectsForNodeType = (nodeType: NodeType) => {
  const categories = categoriesBySummary[nodeType];
  const aspects = categories
    .flatMap((category) => aspectsByCategory[category])
    .filter((aspect) => aspect !== undefined);

  return uniqBy(aspects, (aspect) => aspect);
};
