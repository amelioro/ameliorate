import { Timeline } from "@mui/icons-material";
import { Divider, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";

import { GraphPart, isNode } from "../../utils/diagram";
import { nodeDecorations } from "../../utils/node";
import { StandaloneEdge } from "../Edge/StandaloneEdge";
import { EditableNode } from "../Node/EditableNode";

interface Props {
  graphPart: GraphPart;
}

export const GraphPartDetails = ({ graphPart }: Props) => {
  const partIsNode = isNode(graphPart);
  const GraphPartIcon = partIsNode ? nodeDecorations[graphPart.type].NodeIcon : Timeline;
  const headerText = partIsNode
    ? `${nodeDecorations[graphPart.type].title} Node`
    : `"${graphPart.label}" Edge`;

  return (
    <List>
      <ListItem disablePadding={false}>
        <ListItemIcon>
          <GraphPartIcon />
        </ListItemIcon>
        <ListItemText primary={headerText} />
      </ListItem>

      <Divider />

      <ListItem disablePadding={false} sx={{ justifyContent: "center" }}>
        {partIsNode ? <EditableNode node={graphPart} /> : <StandaloneEdge edge={graphPart} />}
      </ListItem>

      <Divider />
    </List>
  );
};
