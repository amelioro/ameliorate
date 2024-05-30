import { EdgeProps } from "reactflow";

import { ScoreEdge } from "@/web/topic/components/Edge/ScoreEdge";

export const FlowEdge = (flowEdge: EdgeProps) => {
  return <ScoreEdge inReactFlow={true} {...flowEdge} />;
};
