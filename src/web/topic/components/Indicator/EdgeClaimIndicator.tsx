import { claimRelationNames } from "../../../../common/edge";
import { Edge } from "../../utils/diagram";
import { ClaimIndicator } from "./ClaimIndicator";

interface Props {
  edge: Edge;
}

export const EdgeClaimIndicator = ({ edge }: Props) => {
  // don't render indicator for claim nodes because child claims are all already shown together in the claim view
  if (claimRelationNames.includes(edge.label)) return <></>;

  return <ClaimIndicator graphPartId={edge.id} />;
};
