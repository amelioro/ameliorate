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
  NodeIcon: MuiIcon;
}

/**
 * This used to have `title` on it, but that was separated in order to allow title usage separate from
 * the icons (so places don't need to import MUI stuff if they only need the titles).
 *
 * Could refactor this to nodeIcons, but it seems like more decoration stuff could be useful in the
 * future, so I'm leaving it as nodeDecorations for now.
 */
export const nodeDecorations: Record<FlowNodeType, NodeDecoration> = {
  // topic
  problem: {
    NodeIcon: Extension,
  },
  cause: {
    NodeIcon: Mediation,
  },
  criterion: {
    NodeIcon: Ballot,
  },
  benefit: {
    NodeIcon: LocalFlorist,
  },
  effect: {
    NodeIcon: Bolt,
  },
  detriment: {
    NodeIcon: Flood,
  },
  solutionComponent: {
    NodeIcon: Widgets,
  },
  solution: {
    NodeIcon: Check,
  },
  obstacle: {
    NodeIcon: Fence,
  },
  mitigationComponent: {
    NodeIcon: Widgets,
  },
  mitigation: {
    NodeIcon: VerifiedUserOutlined,
  },

  // research
  question: {
    NodeIcon: QuestionMark,
  },
  answer: {
    NodeIcon: LightbulbRounded,
  },
  fact: {
    NodeIcon: Info,
  },
  source: {
    NodeIcon: Code,
  },

  // justification
  rootClaim: {
    NodeIcon: Article,
  },
  support: {
    NodeIcon: ThumbUp,
  },
  critique: {
    NodeIcon: ThumbDown,
  },

  // generic
  custom: {
    NodeIcon: Edit,
  },
};
