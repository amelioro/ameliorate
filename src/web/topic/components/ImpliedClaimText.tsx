import { lowerCase } from "es-toolkit";

import { useEdgeNodes } from "@/web/topic/diagramStore/edgeHooks";
import { GraphPart, isNode as checkIsNode } from "@/web/topic/utils/graph";
import { nodeDecorations } from "@/web/topic/utils/nodeDecoration";

/**
 * Note: this claim text also exists in `getImplicitLabel`, but we want to apply italics/bold html
 * formatting here, so it doesn't seem easy to reuse the text.
 */
export const ImpliedClaimText = ({ graphPart }: { graphPart: GraphPart }) => {
  const [edgeSourceNode, edgeTargetNode] = useEdgeNodes(graphPart.id);

  const isNode = checkIsNode(graphPart);

  if (isNode) {
    return (
      <i>
        "{graphPart.data.label}" <b>is an important {nodeDecorations[graphPart.type].title}</b> in
        this topic
      </i>
    );
  } else {
    if (!edgeSourceNode || !edgeTargetNode) throw new Error("Edge nodes not found");

    return (
      <i>
        <b>{nodeDecorations[edgeSourceNode.type].title}</b> "{edgeSourceNode.data.label}"{" "}
        <b>
          {lowerCase(graphPart.label)} {nodeDecorations[edgeTargetNode.type].title}
        </b>{" "}
        "{edgeTargetNode.data.label}"
      </i>
    );
  }
};
