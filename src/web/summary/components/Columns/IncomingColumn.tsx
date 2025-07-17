import { NorthEast } from "@mui/icons-material";
import { Divider, Typography } from "@mui/material";
import { Fragment } from "react";

import { Row } from "@/web/summary/components/Row";
import { useIncomingNodesByRelationDescription } from "@/web/topic/diagramStore/summary";
import { Node } from "@/web/topic/utils/graph";

interface Props {
  summaryNode: Node;
}

export const IncomingColumn = ({ summaryNode }: Props) => {
  const incomingByDescription = useIncomingNodesByRelationDescription(summaryNode);

  return (
    <div className="flex flex-col">
      {Object.keys(incomingByDescription).length === 0 && (
        <Typography variant="body2" className="self-center">
          No nodes yet!
        </Typography>
      )}

      {Object.entries(incomingByDescription).map(([relationDescription, nodes], index) => (
        <Fragment key={relationDescription}>
          {index > 0 && <Divider className="mx-2 my-1" />}

          <Row title={relationDescription} Icon={NorthEast} nodes={nodes} />
        </Fragment>
      ))}
    </div>
  );
};
