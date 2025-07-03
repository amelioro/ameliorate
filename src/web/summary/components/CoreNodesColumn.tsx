import { Star } from "@mui/icons-material";

import { Row } from "@/web/summary/components/Row";
import { useCoreNodes } from "@/web/topic/diagramStore/nodeHooks";

export const CoreNodesColumn = () => {
  const coreNodes = useCoreNodes();

  return (
    <>
      <Row title="Core Nodes" Icon={Star} nodes={coreNodes} />
    </>
  );
};
