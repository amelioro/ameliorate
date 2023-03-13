import { Ballot, BallotOutlined } from "@mui/icons-material";

import { toggleShowCriteria } from "../../store/actions";
import { useNode, useNodeChildren } from "../../store/nodeHooks";
import { Indicator } from "../Indicator/Indicator";

interface Props {
  nodeId: string;
  diagramId: string;
}

export const CriteriaIndicator = ({ nodeId, diagramId }: Props) => {
  const node = useNode(nodeId, diagramId);
  const nodeChildren = useNodeChildren(nodeId, diagramId);

  const criteria = nodeChildren.filter((child) => child.type === "criterion");

  if (node === null || node.type !== "problem" || criteria.length === 0) {
    return <></>;
  }

  const allCriteriaShown = criteria.every((child) => child.data.showing);

  const Icon = allCriteriaShown ? Ballot : BallotOutlined;

  return <Indicator Icon={Icon} onClick={() => toggleShowCriteria(nodeId, !allCriteriaShown)} />;
};
