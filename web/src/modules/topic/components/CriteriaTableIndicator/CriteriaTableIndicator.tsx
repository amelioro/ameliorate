import { TableChart, TableChartOutlined } from "@mui/icons-material";

import { viewCriteriaTable } from "../../store/actions";
import { useNode, useNodeChildren } from "../../store/nodeHooks";
import { Indicator } from "../Indicator/Indicator";

interface Props {
  nodeId: string;
  diagramId: string;
}

export const CriteriaTableIndicator = ({ nodeId, diagramId }: Props) => {
  const node = useNode(nodeId, diagramId);
  const nodeChildren = useNodeChildren(nodeId, diagramId);

  const hasCriteria = nodeChildren.some((child) => child.type === "criterion");

  if (node === null || node.type !== "problem") {
    return <></>;
  }

  const Icon = hasCriteria ? TableChart : TableChartOutlined;

  return <Indicator Icon={Icon} onClick={() => viewCriteriaTable(nodeId)} />;
};
