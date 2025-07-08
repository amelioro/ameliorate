import { NorthEast } from "@mui/icons-material";

import { Row } from "@/web/summary/components/Row";
import { useNeighborsByRelationDescription } from "@/web/topic/diagramStore/summary";
import { Node } from "@/web/topic/utils/graph";

interface Props {
  summaryNode: Node;
}

export const AllColumn = ({ summaryNode }: Props) => {
  const neighborsByRelation = useNeighborsByRelationDescription(summaryNode);

  return (
    <div className="flex flex-col gap-2">
      {Object.entries(neighborsByRelation).map(([relationDescription, nodes]) => (
        <Row key={relationDescription} title={relationDescription} Icon={NorthEast} nodes={nodes} />
      ))}
    </div>
  );
};
