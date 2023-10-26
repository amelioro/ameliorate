import { EdgeProps } from "reactflow";

import { ScoreEdge } from "./ScoreEdge";

export const FlowEdge = (flowEdge: EdgeProps) => {
  return <ScoreEdge inReactFlow={true} {...flowEdge} />;
};
