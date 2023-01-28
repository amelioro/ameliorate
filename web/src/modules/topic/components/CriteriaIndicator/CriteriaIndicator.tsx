import { Ballot, BallotOutlined } from "@mui/icons-material";

import { toggleShowCriteria } from "../../store/actions";
import { useNode, useNodeChildren } from "../../store/nodeHooks";
import { ProblemNode } from "../../utils/diagram";
import { Indicator } from "../Indicator/Indicator";

interface Props {
  nodeId: string;
}

export const CriteriaIndicator = ({ nodeId }: Props) => {
  const node = useNode(nodeId);
  const nodeChildren = useNodeChildren(nodeId);

  const hasCriteria = nodeChildren.some((child) => child.type === "criterion");

  if (node.type !== "problem" || !hasCriteria) {
    return <></>;
  }

  const problemNode = node as ProblemNode;

  const Icon = problemNode.data.showCriteria ? Ballot : BallotOutlined;

  return <Indicator Icon={Icon} onClick={() => toggleShowCriteria(nodeId)} />;
};
