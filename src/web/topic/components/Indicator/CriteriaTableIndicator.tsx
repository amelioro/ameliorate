import { TableChart, TableChartOutlined } from "@mui/icons-material";

import { useNodeChildren } from "../../store/nodeHooks";
import { viewCriteriaTable } from "../../store/viewActions";
import { ProblemNode } from "../../utils/graph";
import { Indicator } from "../Indicator/Indicator";

interface Props {
  node: ProblemNode;
}

export const CriteriaTableIndicator = ({ node }: Props) => {
  const nodeChildren = useNodeChildren(node.id);

  const hasCriteria = nodeChildren.some((child) => child.type === "criterion");

  const Icon = hasCriteria ? TableChart : TableChartOutlined;

  return (
    <Indicator
      Icon={Icon}
      title={"View criteria table"}
      onClick={() => viewCriteriaTable(node.id)}
    />
  );
};
