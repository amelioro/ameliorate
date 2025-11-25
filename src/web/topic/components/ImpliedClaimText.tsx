import { lowerCase } from "es-toolkit";

import { prettyNodeTypes } from "@/common/node";
import { useEdgeNodes } from "@/web/topic/diagramStore/edgeHooks";
import { GraphPart, isNode as checkIsNode } from "@/web/topic/utils/graph";

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
        "{graphPart.data.label}" <b>is an important {prettyNodeTypes[graphPart.type]}</b> in this
        topic
      </i>
    );
  } else {
    if (!edgeSourceNode || !edgeTargetNode) throw new Error("Edge nodes not found");

    return (
      <i>
        <b>{prettyNodeTypes[edgeSourceNode.type]}</b> "{edgeSourceNode.data.label}"{" "}
        <b>
          {lowerCase(graphPart.label)} {prettyNodeTypes[edgeTargetNode.type]}
        </b>{" "}
        "{edgeTargetNode.data.label}"
      </i>
    );
  }
};
