import { lowerCase } from "es-toolkit";

import { useEdgeNodes } from "@/web/topic/diagramStore/edgeHooks";
import { GraphPart, isNode as checkIsNode } from "@/web/topic/utils/graph";
import { nodeDecorations } from "@/web/topic/utils/node";

/**
 * Note: this claim text also exists in `getImplicitLabel`, but we want to apply italics/bold html
 * formatting here, so it doesn't seem easy to reuse the text.
 */
export const ImpliedClaimText = ({ graphPart }: { graphPart: GraphPart }) => {
  const [edgeParentNode, edgeChildNode] = useEdgeNodes(graphPart.id);

  const isNode = checkIsNode(graphPart);

  if (isNode) {
    return (
      <i>
        "{graphPart.data.label}" <b>is an important {nodeDecorations[graphPart.type].title}</b> in
        this topic
      </i>
    );
  } else {
    if (!edgeParentNode || !edgeChildNode) throw new Error("Edge nodes not found");

    return (
      <i>
        <b>{nodeDecorations[edgeChildNode.type].title}</b> "{edgeChildNode.data.label}"{" "}
        <b>
          {lowerCase(graphPart.label)} {nodeDecorations[edgeParentNode.type].title}
        </b>{" "}
        "{edgeParentNode.data.label}"
      </i>
    );
  }
};
