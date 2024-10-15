import { WbTwilight } from "@mui/icons-material";
import { type ButtonProps } from "@mui/material";
import { MouseEventHandler, memo, useCallback } from "react";

import { Indicator } from "@/web/topic/components/Indicator/Indicator";
import { stopForcingNodeToShow, useIsNodeForcedToShow } from "@/web/view/currentViewStore/filter";

interface Props {
  nodeId: string;
  partColor: ButtonProps["color"];
}

// TODO: only show if we're a FlowNode
const ForceShownIndicatorBase = ({ nodeId, partColor }: Props) => {
  const nodeIsForcedToShow = useIsNodeForcedToShow(nodeId);

  const onClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    () => stopForcingNodeToShow(nodeId),
    [nodeId],
  );

  if (!nodeIsForcedToShow) return <></>;

  return (
    <Indicator
      Icon={WbTwilight}
      title={"Stop forcing node to show"}
      onClick={onClick}
      iconHasBackground={false}
      color={partColor}
    />
  );
};

export const ForceShownIndicator = memo(ForceShownIndicatorBase);
