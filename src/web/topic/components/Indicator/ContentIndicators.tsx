import { type ButtonProps, Stack } from "@mui/material";
import { memo } from "react";

import { FoundResearchIndicator } from "./FoundResearchIndicator";
import { JustificationIndicator } from "./JustificationIndicator";
import { QuestionIndicator } from "./QuestionIndicator";

interface Props {
  graphPartId: string;
  color: ButtonProps["color"];
  className?: string;
}

const ContentIndicatorsBase = ({ graphPartId, color, className }: Props) => {
  return (
    <Stack direction="row" margin="2px" spacing="2px" className={className}>
      <QuestionIndicator graphPartId={graphPartId} partColor={color} />
      <FoundResearchIndicator graphPartId={graphPartId} partColor={color} />
      <JustificationIndicator graphPartId={graphPartId} partColor={color} />
    </Stack>
  );
};

export const ContentIndicators = memo(ContentIndicatorsBase);
