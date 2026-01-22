import { NodeType, prettyNodeTypes } from "@/common/node";
import { ColoredNodeIcon } from "@/web/topic/components/ColoredNodeIcon";

/**
 * For usage within text, to make more clear that we're referring to a type of node.
 */
export const NodeTypeText = ({ type }: { type: NodeType }) => {
  const title = prettyNodeTypes[type];

  return (
    <span className="text-nowrap">
      <span>{title}</span>
      <ColoredNodeIcon type={type} className="ml-1 size-4 rounded-sm p-0.5" />
    </span>
  );
};
