import { NorthEast } from "@mui/icons-material";
import { Divider, Typography } from "@mui/material";
import { Fragment } from "react";

import { Row } from "@/web/summary/components/Row";
import { useOutgoingNodesByRelationDescription } from "@/web/topic/diagramStore/summary";
import { Node } from "@/web/topic/utils/graph";

interface Props {
  summaryNode: Node;
}

export const OutgoingColumn = ({ summaryNode }: Props) => {
  const outgoingByDescription = useOutgoingNodesByRelationDescription(summaryNode);

  return (
    <div className="flex flex-col">
      {Object.keys(outgoingByDescription).length === 0 && (
        <Typography variant="body2" className="self-center">
          No nodes yet!
        </Typography>
      )}

      {Object.entries(outgoingByDescription).map(([relationDescription, nodes], index) => (
        <Fragment key={relationDescription}>
          {index > 0 && <Divider className="mx-2 my-1" />}

          <Row title={relationDescription} Icon={NorthEast} nodes={nodes} />
        </Fragment>
      ))}
    </div>
  );
};
