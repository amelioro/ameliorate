import { WbTwilight } from "@mui/icons-material";
import { type ButtonProps } from "@mui/material";
import { MouseEventHandler, memo, useCallback } from "react";

import { stopForcingNodeToShow, useIsNodeForcedToShow } from "../../../view/navigateStore";
import { Indicator } from "./Indicator";

interface Props {
  nodeId: string;
  partColor: ButtonProps["color"];
}

// TODO: only show if we're a FlowNode
const ForceShownIndicatorBase = ({ nodeId, partColor }: Props) => {
  const nodeIsForcedToShow = useIsNodeForcedToShow(nodeId);

  const onClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      stopForcingNodeToShow(nodeId);
      event.stopPropagation(); // prevent selecting the node and awkwardly re-showing if flashlight mode is on
    },
    [nodeId]
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
