import { useTheme } from "@mui/material";
import { LayoutGroup } from "framer-motion";
import { MouseEvent } from "react";

import { prettyNodeTypes } from "@/common/node";
import { Tooltip } from "@/web/common/components/Tooltip/Tooltip";
import { primarySpotlightColor } from "@/web/topic/components/Diagram/Diagram.styles";
import { EditableNode } from "@/web/topic/components/Node/EditableNode";
import { useIsCoreNode } from "@/web/topic/diagramStore/nodeHooks";
import { Node } from "@/web/topic/utils/graph";
import { nodeDecorations } from "@/web/topic/utils/nodeDecoration";
import { useIsGraphPartSelected } from "@/web/view/selectedPartStore";

interface Props {
  node: Node;
  className?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

export const IconNode = ({ node, className, onClick }: Props) => {
  const theme = useTheme();

  const isSelected = useIsGraphPartSelected(node.id);
  const isCoreNode = useIsCoreNode(node.id);

  const nodeColor = theme.palette[node.type].main;
  const nodeLightColor = `color-mix(in oklch, ${nodeColor}, #fff 80%)`;
  const NodeIcon = nodeDecorations[node.type].NodeIcon;

  const typeText = node.data.customType ?? prettyNodeTypes[node.type];
  const nodeDescription = `${typeText}: ${node.data.label}`;

  const tooltipBody = (
    // Slight hack to ensure that the tooltip node doesn't animate towards/from a currently-showing node, which would cause that node to disappear.
    // Doing this hack because didn't want to create a separate Workspace Context for the tooltip (which is how we prevent animating in other undesirable spots).
    <LayoutGroup id="tooltip">
      {/* lots of padding as a small hack to ensure the node toolbar doesn't flicker to reposition when the tooltip opens */}
      <div className="flex p-10">
        <EditableNode node={node} />
      </div>
    </LayoutGroup>
  );

  const nodeIcon = (
    <NodeIcon
      fontSize="small"
      sx={{
        backgroundColor: nodeLightColor,
        border: `1px solid ${isSelected ? primarySpotlightColor : isCoreNode ? nodeColor : "transparent"}`,
        boxShadow: isSelected
          ? `0 0 0 1px ${primarySpotlightColor}, 0 0 0 1px ${primarySpotlightColor}`
          : "none",
      }}
      className={"rounded p-[0.0625rem]" + (className ? ` ${className}` : "")}
    />
  );

  return (
    <Tooltip
      tooltipBody={tooltipBody}
      immediatelyOpenOnTouch={false}
      // set zIndex to MuiMenu - 1 as a hack to allow context menu to show in front
      tooltipPopperClassName="z-[1299]"
    >
      <button
        className={"flex" + (onClick ? "" : " cursor-default")}
        onClick={onClick}
        aria-label={nodeDescription}
      >
        {nodeIcon}
      </button>
    </Tooltip>
  );
};
