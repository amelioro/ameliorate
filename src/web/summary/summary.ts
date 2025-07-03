import { nodeTypes } from "@/common/node";

const summaries = ["topic", ...nodeTypes] as const;
export type Summary = (typeof summaries)[number];

// categories are used as tabs in the summary view
const categories = ["coreNodes"] as const;
export type Category = (typeof categories)[number];

export const categoriesBySummary: Partial<Record<Summary, Category[]>> = {
  topic: ["coreNodes"],
};

// aspects are used as columns with a summary view's tab
const topicAspects = ["coreNodes"] as const;
const nodeAspects = ["components"] as const;
// const aspects = [...topicAspects, ...nodeAspects] as const;

export type TopicAspect = (typeof topicAspects)[number];
export type NodeAspect = (typeof nodeAspects)[number];
export type Aspect = TopicAspect | NodeAspect;

export const aspectsByCategory: Partial<Record<Category, Aspect[]>> = {
  coreNodes: ["coreNodes"],
};
