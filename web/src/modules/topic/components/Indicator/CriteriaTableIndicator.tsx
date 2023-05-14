import { TableChart, TableChartOutlined } from "@mui/icons-material";
import Tooltip from "@mui/material/Tooltip";
import React from "react";

import { useNode, useNodeChildren } from "../../store/nodeHooks";
import { viewCriteriaTable } from "../../store/viewActions";
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
   
     
  return (
    <Tooltip title="View criteria table">

    <Indicator  Icon={Icon} onClick={() => viewCriteriaTable(nodeId)}  />
        
    </Tooltip>
  );

};
