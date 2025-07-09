import { NorthEast } from "@mui/icons-material";
import { Divider, Typography } from "@mui/material";
import { Fragment } from "react";

import { Row } from "@/web/summary/components/Row";
import { useNeighborsByRelationDescription } from "@/web/topic/diagramStore/summary";
import { Node } from "@/web/topic/utils/graph";

interface Props {
  summaryNode: Node;
}

export const AllColumn = ({ summaryNode }: Props) => {
  const neighborsByRelation = useNeighborsByRelationDescription(summaryNode);

  return (
    <div className="flex flex-col">
      {Object.keys(neighborsByRelation).length === 0 && (
        <Typography variant="body2" className="self-center">
          No nodes yet!
        </Typography>
      )}

      {Object.entries(neighborsByRelation).map(([relationDescription, nodes], index) => (
        <Fragment key={relationDescription}>
          {index > 0 && <Divider className="mx-2 my-1" />}

          <Row title={relationDescription} Icon={NorthEast} nodes={nodes} />
        </Fragment>
      ))}
    </div>
  );
};
