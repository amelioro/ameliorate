import { useTheme } from "@mui/material";

import { NodeType } from "@/common/node";
import { nodeDecorations } from "@/web/topic/utils/nodeDecoration";

interface ColoredNodeIconProps {
  type: NodeType;
  variant?: "colorBackground" | "colorForeground";
  className?: string;
}

export const ColoredNodeIcon = ({
  type,
  variant = "colorBackground",
  className,
}: ColoredNodeIconProps) => {
  const theme = useTheme();
  const { NodeIcon } = nodeDecorations[type];

  return variant === "colorForeground" ? (
    <NodeIcon className={className} sx={{ color: theme.palette[type].main }} />
  ) : (
    <NodeIcon className={className} sx={{ backgroundColor: theme.palette[type].main }} />
  );
};
