import { useTheme } from "@mui/material";

import { useNode } from "@/web/topic/diagramStore/nodeHooks";
import { Node } from "@/web/topic/utils/graph";
import { nodeDecorations } from "@/web/topic/utils/nodeDecoration";

interface Props {
  node: Node;
}

/**
 * A minimal node representation showing only the type icon and node text.
 *
 * Used e.g. in the hidden path panel to show hidden nodes compactly.
 */
export const CompressedNode = ({ node }: Props) => {
  const theme = useTheme();

  const nodeColor = theme.palette[node.type].main;
  const nodeLightColor = `color-mix(in oklch, ${nodeColor}, #fff 80%)`;
  const NodeIcon = nodeDecorations[node.type].NodeIcon;

  return (
    <div
      className="flex items-center gap-1.5 rounded-md border px-2 py-1"
      style={{ backgroundColor: nodeLightColor, borderColor: nodeColor }}
    >
      <NodeIcon fontSize="small" />
      <span className="text-sm">{node.data.text}</span>
    </div>
  );
};

/**
 * Wrapper that solely exists to get the node by id to then pass to `CompressedNode`.
 */
export const CompressedNodeViaId = ({ nodeId }: { nodeId: string }) => {
  const node = useNode(nodeId);

  if (!node) return null;

  return <CompressedNode node={node} />;
};
