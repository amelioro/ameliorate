import { type ButtonProps, Stack } from "@mui/material";
import { memo } from "react";

import { CommentIndicator } from "@/web/topic/components/Indicator/CommentIndicator";
import { FoundResearchIndicator } from "@/web/topic/components/Indicator/FoundResearchIndicator";
import { JustificationIndicator } from "@/web/topic/components/Indicator/JustificationIndicator";
import { QuestionIndicator } from "@/web/topic/components/Indicator/QuestionIndicator";
import { GraphPartType } from "@/web/topic/utils/graph";

interface Props {
  graphPartId: string;
  graphPartType: GraphPartType;
  color: ButtonProps["color"];
  className?: string;
}

const ContentIndicatorsBase = ({ graphPartId, graphPartType, color, className }: Props) => {
  return (
    <Stack direction="row" margin="2px" spacing="2px" className={className}>
      <JustificationIndicator graphPartId={graphPartId} partColor={color} />
      <QuestionIndicator graphPartId={graphPartId} partColor={color} />
      <FoundResearchIndicator graphPartId={graphPartId} partColor={color} />
      <CommentIndicator graphPartId={graphPartId} graphPartType={graphPartType} partColor={color} />
    </Stack>
  );
};

export const ContentIndicators = memo(ContentIndicatorsBase);
