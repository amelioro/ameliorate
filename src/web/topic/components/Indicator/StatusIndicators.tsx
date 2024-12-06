import { type ButtonProps, Stack } from "@mui/material";
import { memo } from "react";

import { ForceShownIndicator } from "@/web/topic/components/Indicator/ForceShownIndicator";
import { useIndicateWhenNodeForcedToShow } from "@/web/view/userConfigStore";

interface Props {
  graphPartId: string;
  color: ButtonProps["color"];
  className?: string;
}

/**
 * Future: e.g. controversial, hot, solid
 */
const StatusIndicatorsBase = ({ graphPartId, color, className }: Props) => {
  const indicateWhenNodeForcedToShow = useIndicateWhenNodeForcedToShow();

  return (
    <Stack direction="row" margin="2px" spacing="2px" className={className}>
      {indicateWhenNodeForcedToShow && (
        <ForceShownIndicator nodeId={graphPartId} partColor={color} />
      )}
    </Stack>
  );
};

export const StatusIndicators = memo(StatusIndicatorsBase);
