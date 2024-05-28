import { type ButtonProps, Stack } from "@mui/material";
import { memo } from "react";

import { GraphPartType } from "../../utils/graph";
import { CommentIndicator } from "./CommentIndicator";
import { FoundResearchIndicator } from "./FoundResearchIndicator";
import { JustificationIndicator } from "./JustificationIndicator";
import { QuestionIndicator } from "./QuestionIndicator";

interface Props {
  graphPartId: string;
  graphPartType: GraphPartType;
  color: ButtonProps["color"];
  className?: string;
}

const ContentIndicatorsBase = ({ graphPartId, graphPartType, color, className }: Props) => {
  return (
    <Stack direction="row" margin="2px" spacing="2px" className={className}>
      <QuestionIndicator graphPartId={graphPartId} partColor={color} />
      <FoundResearchIndicator graphPartId={graphPartId} partColor={color} />
      <JustificationIndicator graphPartId={graphPartId} partColor={color} />
      <CommentIndicator graphPartId={graphPartId} graphPartType={graphPartType} partColor={color} />
    </Stack>
  );
};

export const ContentIndicators = memo(ContentIndicatorsBase);
