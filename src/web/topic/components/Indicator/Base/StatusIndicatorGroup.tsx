import { Stack } from "@mui/material";
import { memo } from "react";

import { ForceShownIndicator } from "@/web/topic/components/Indicator/ForceShownIndicator";
import { NotesIndicator } from "@/web/topic/components/Indicator/NotesIndicator";
import { useIndicateWhenNodeForcedToShow } from "@/web/view/userConfigStore";

interface Props {
  graphPartId: string;
  bgColor: string;
  notes: string;
  className?: string;
}

/**
 * Future: e.g. controversial, hot, solid
 */
const StatusIndicatorGroupBase = ({ graphPartId, bgColor, notes, className }: Props) => {
  const indicateWhenNodeForcedToShow = useIndicateWhenNodeForcedToShow();

  return (
    <Stack direction="row" margin="2px" spacing="2px" className={className}>
      {indicateWhenNodeForcedToShow && (
        <ForceShownIndicator nodeId={graphPartId} bgColor={bgColor} />
      )}
      {/* This is more of a content indicator, but there isn't enough space to show 5 content indicators */}
      {/* to the right of the node handle, so we're putting it here as an easy hack. */}
      {/* TODO: https://github.com/amelioro/ameliorate/issues/630 */}
      <NotesIndicator graphPartId={graphPartId} notes={notes} bgColor={bgColor} />
    </Stack>
  );
};

export const StatusIndicatorGroup = memo(StatusIndicatorGroupBase);
