import { NorthEast } from "@mui/icons-material";
import { Divider, Typography } from "@mui/material";
import { Fragment } from "react";

import { Row } from "@/web/summary/components/Row";
import { AddNodeButtonGroup } from "@/web/topic/components/Node/AddNodeButtonGroup";
import { useEffectType } from "@/web/topic/diagramStore/nodeTypeHooks";
import { useIncomingNodesByRelationDescription } from "@/web/topic/diagramStore/summary";
import { addableRelationsFrom } from "@/web/topic/utils/edge";
import { Node } from "@/web/topic/utils/graph";

interface Props {
  summaryNode: Node;
}

export const IncomingColumn = ({ summaryNode }: Props) => {
  const incomingByDescription = useIncomingNodesByRelationDescription(summaryNode);
  const effectType = useEffectType(summaryNode.id);

  const defaultSourceAddableRelations = addableRelationsFrom(
    summaryNode.type,
    "source",
    false,
    effectType,
  );

  const addableRelations = defaultSourceAddableRelations;

  const AddButtons = (
    <div className="pb-1.5">
      <AddNodeButtonGroup fromNodeId={summaryNode.id} addableRelations={addableRelations} />
    </div>
  );

  return (
    <div className="flex flex-col">
      <Row title="Incoming" Icon={NorthEast} addButtonsSlot={AddButtons} />

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
