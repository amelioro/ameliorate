import { useTheme } from "@mui/material";

import { NodeType, prettyNodeTypes } from "@/common/node";
import { nodeDecorations } from "@/web/topic/utils/nodeDecoration";

/**
 * For usage within text, to make more clear that we're referring to a type of node.
 */
export const NodeTypeText = ({ type }: { type: NodeType }) => {
  const theme = useTheme();
  const { NodeIcon } = nodeDecorations[type];
  const title = prettyNodeTypes[type];

  return (
    <span className="text-nowrap">
      <span>{title}</span>
      <NodeIcon
        className="ml-1 size-4 rounded-sm p-0.5"
        sx={{ backgroundColor: theme.palette[type].main }}
      />
    </span>
  );
};
