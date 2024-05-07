import { TableChart, TableChartOutlined } from "@mui/icons-material";
import { memo, useCallback } from "react";

import { viewCriteriaTable } from "../../../view/currentViewStore/store";
import { useNode, useNodeChildren } from "../../store/nodeHooks";
import { Node, ProblemNode } from "../../utils/graph";
import { Indicator } from "../Indicator/Indicator";

const isProblem = (node: Node): node is ProblemNode => node.type === "problem";

interface Props {
  nodeId: string;
}

const CriteriaTableIndicatorBase = ({ nodeId }: Props) => {
  const node = useNode(nodeId);
  const nodeChildren = useNodeChildren(nodeId);

  const onClick = useCallback(() => viewCriteriaTable(nodeId), [nodeId]);

  if (!node || !isProblem(node)) return <></>;

  const hasCriteria = nodeChildren.some((child) => child.type === "criterion");

  const Icon = hasCriteria ? TableChart : TableChartOutlined;

  return <Indicator Icon={Icon} title={"View criteria table"} onClick={onClick} />;
};

export const CriteriaTableIndicator = memo(CriteriaTableIndicatorBase);
