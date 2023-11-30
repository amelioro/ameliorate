import { claimNodeTypes } from "../../../../common/node";
import { Node } from "../../utils/graph";
import { ClaimIndicator } from "./ClaimIndicator";

interface Props {
  node: Node;
}

export const NodeClaimIndicator = ({ node }: Props) => {
  // don't render indicator for claim nodes because child claims are all already shown together in the claim view
  if (claimNodeTypes.includes(node.type)) return <></>;

  return <ClaimIndicator graphPartId={node.id} />;
};
