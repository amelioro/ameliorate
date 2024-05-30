import { type ButtonProps, Stack } from "@mui/material";
import { memo } from "react";

import { ForceShownIndicator } from "@/web/topic/components/Indicator/ForceShownIndicator";

interface Props {
  graphPartId: string;
  color: ButtonProps["color"];
  className?: string;
}

/**
 * Future: e.g. controversial, hot, solid
 */
const StatusIndicatorsBase = ({ graphPartId, color, className }: Props) => {
  return (
    <Stack direction="row" margin="2px" spacing="2px" className={className}>
      <ForceShownIndicator nodeId={graphPartId} partColor={color} />
    </Stack>
  );
};

export const StatusIndicators = memo(StatusIndicatorsBase);
