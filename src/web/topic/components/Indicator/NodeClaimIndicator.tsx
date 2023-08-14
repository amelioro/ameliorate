import { Node, topicDiagramId } from "../../utils/diagram";
import { ClaimIndicator } from "./ClaimIndicator";

interface Props {
  node: Node;
}

export const NodeClaimIndicator = ({ node }: Props) => {
  // don't render indicator for claim nodes because child claims are all already shown together in the claim view
  if (node.data.diagramId !== topicDiagramId) return <></>;

  return <ClaimIndicator graphPartId={node.id} graphPartType="node" />;
};
