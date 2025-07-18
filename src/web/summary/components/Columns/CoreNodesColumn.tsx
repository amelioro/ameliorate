import { Star } from "@mui/icons-material";

import { Row } from "@/web/summary/components/Row";
import { AddNodeButton } from "@/web/topic/components/Node/AddNodeButton";
import { useCoreNodes } from "@/web/topic/diagramStore/nodeHooks";

const AddButtons = (
  <div className="pb-1.5">
    <AddNodeButton toNodeType="problem" />
    <AddNodeButton toNodeType="solution" />
  </div>
);

export const CoreNodesColumn = () => {
  const coreNodes = useCoreNodes();

  return (
    <>
      <Row title="Core Nodes" Icon={Star} nodes={coreNodes} addButtonsSlot={AddButtons} />
    </>
  );
};
