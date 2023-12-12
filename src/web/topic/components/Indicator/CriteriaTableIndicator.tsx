import { TableChart, TableChartOutlined } from "@mui/icons-material";
import { useCallback } from "react";

import { viewCriteriaTable } from "../../../view/navigateStore";
import { useNodeChildren } from "../../store/nodeHooks";
import { ProblemNode } from "../../utils/graph";
import { Indicator } from "../Indicator/Indicator";

interface Props {
  node: ProblemNode;
}

export const CriteriaTableIndicator = ({ node }: Props) => {
  const nodeChildren = useNodeChildren(node.id);

  const hasCriteria = nodeChildren.some((child) => child.type === "criterion");

  const Icon = hasCriteria ? TableChart : TableChartOutlined;

  const onClick = useCallback(() => viewCriteriaTable(node.id), [node.id]);

  return <Indicator Icon={Icon} title={"View criteria table"} onClick={onClick} />;
};
