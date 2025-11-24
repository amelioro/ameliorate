/**
 * Extracted from node.ts so that things can reach into node.ts for graph utils without needing to
 * pull in e.g. MUI dependencies. Motivated by hacking a topicAI route that needs to use
 * aspectFilter.ts (this should be completely doable in common/ but graph utils need to be
 * refactored to move to common/ first, which will take more effort...).
 */
import {
  Article,
  Ballot,
  Bolt,
  Check,
  Code,
  Edit,
  Extension,
  Fence,
  Flood,
  Info,
  LightbulbRounded,
  LocalFlorist,
  Mediation,
  QuestionMark,
  ThumbDown,
  ThumbUp,
  VerifiedUserOutlined,
  Widgets,
} from "@mui/icons-material";

import { FlowNodeType } from "@/web/topic/utils/node";

export const indicatorLengthRem = 1.25; // rem

export type MuiIcon = typeof Extension;

interface NodeDecoration {
  title: string;
  NodeIcon: MuiIcon;
}

export const nodeDecorations: Record<FlowNodeType, NodeDecoration> = {
  // topic
  problem: {
    title: "Problem",
    NodeIcon: Extension,
  },
  cause: {
    title: "Cause",
    NodeIcon: Mediation,
  },
  criterion: {
    title: "Criterion",
    NodeIcon: Ballot,
  },
  benefit: {
    title: "Benefit",
    NodeIcon: LocalFlorist,
  },
  effect: {
    title: "Effect",
    NodeIcon: Bolt,
  },
  detriment: {
    title: "Detriment",
    NodeIcon: Flood,
  },
  solutionComponent: {
    title: "Component",
    NodeIcon: Widgets,
  },
  solution: {
    title: "Solution",
    NodeIcon: Check,
  },
  obstacle: {
    title: "Obstacle",
    NodeIcon: Fence,
  },
  mitigationComponent: {
    title: "Component",
    NodeIcon: Widgets,
  },
  mitigation: {
    title: "Mitigation",
    NodeIcon: VerifiedUserOutlined,
  },

  // research
  question: {
    title: "Question",
    NodeIcon: QuestionMark,
  },
  answer: {
    title: "Answer",
    NodeIcon: LightbulbRounded,
  },
  fact: {
    title: "Fact",
    NodeIcon: Info,
  },
  source: {
    title: "Source",
    NodeIcon: Code,
  },

  // justification
  rootClaim: {
    title: "Root Claim",
    NodeIcon: Article,
  },
  support: {
    title: "Support",
    NodeIcon: ThumbUp,
  },
  critique: {
    title: "Critique",
    NodeIcon: ThumbDown,
  },

  // generic
  custom: {
    title: "Custom",
    NodeIcon: Edit,
  },
};
