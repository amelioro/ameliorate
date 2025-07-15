import { useTheme } from "@mui/material";

import { IconWithTooltip } from "@/web/common/components/Tooltip/IconWithTooltip";
import { primarySpotlightColor } from "@/web/topic/components/Diagram/Diagram.styles";
import { EditableNode } from "@/web/topic/components/Node/EditableNode";
import { useIsCoreNode } from "@/web/topic/diagramStore/nodeHooks";
import { Node } from "@/web/topic/utils/graph";
import { nodeDecorations } from "@/web/topic/utils/node";
import { useIsGraphPartSelected } from "@/web/view/selectedPartStore";

interface Props {
  node: Node;
  className?: string;
}

export const IconNode = ({ node, className }: Props) => {
  const theme = useTheme();

  const isSelected = useIsGraphPartSelected(node.id);
  const isCoreNode = useIsCoreNode(node.id);

  const nodeDecoration = nodeDecorations[node.type];
  const nodeColor = theme.palette[node.type].main;
  const nodeLightColor = `color-mix(in oklch, ${nodeColor}, #fff 80%)`;
  const NodeIcon = nodeDecoration.NodeIcon;

  const typeText = node.data.customType ?? nodeDecoration.title;
  const nodeDescription = `${typeText}: ${node.data.label}`;

  const tooltipBody = (
    // lots of padding as a small hack to ensure the node toolbar doesn't flicker to reposition when the tooltip opens
    <div className="flex p-10">
      <EditableNode node={node} />
    </div>
  );

  const nodeIcon = (
    <NodeIcon
      aria-label={nodeDescription}
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
    <IconWithTooltip
      ariaLabel={nodeDescription}
      tooltipBody={tooltipBody}
      icon={nodeIcon}
      // set zIndex to MuiMenu - 1 as a hack to allow context menu to show in front
      tooltipPopperClassName="z-[1299]"
    />
  );
};
