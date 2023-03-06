import { problemDiagramId } from "../../store/store";
import { Node } from "../../utils/diagram";
import { ClaimIndicator } from "./ClaimIndicator";

interface Props {
  node: Node;
}

export const NodeClaimIndicator = ({ node }: Props) => {
  // don't render indicator for claim nodes because child claims are all already shown together in the claim view
  if (node.data.diagramId !== problemDiagramId) return <></>;

  return <ClaimIndicator arguableId={node.id} arguableType="node" />;
};
