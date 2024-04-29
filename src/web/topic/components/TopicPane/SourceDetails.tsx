import { Info, Schema } from "@mui/icons-material";
import { ListItem, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";

import { useSourceDetails } from "../../store/nodeTypeHooks";
import { Node } from "../../utils/graph";
import { StandaloneEdge } from "../Edge/StandaloneEdge";
import { AddNodeButton } from "../Node/AddNodeButton";
import { EditableNode } from "../Node/EditableNode";

interface Props {
  sourceNode: Node & { type: "source" };
}

export const SourceDetails = ({ sourceNode }: Props) => {
  const { nodesRelevantFor, edgesRelevantFor, facts } = useSourceDetails(sourceNode.id);

  return (
    <>
      <ListItem disablePadding={false}>
        <ListItemIcon>
          <Schema />
        </ListItemIcon>
        <ListItemText primary="Relevant For" />
      </ListItem>

      <Stack
        direction="row"
        justifyContent="center"
        alignItems="stretch"
        flexWrap="wrap"
        useFlexGap
        spacing="2px"
      >
        {nodesRelevantFor.length === 0 && edgesRelevantFor.length === 0 && (
          <Typography>No relevant parts yet!</Typography>
        )}
        {nodesRelevantFor.length > 0 &&
          nodesRelevantFor.map((node) => <EditableNode key={node.id} node={node} supplemental />)}
        {edgesRelevantFor.length > 0 &&
          edgesRelevantFor.map((edge) => <StandaloneEdge key={edge.id} edge={edge} />)}
      </Stack>

      <ListItem disablePadding={false}>
        <ListItemIcon>
          <Info />
        </ListItemIcon>
        <ListItemText primary="Facts" />
      </ListItem>

      <Stack direction="row" justifyContent="center" alignItems="center" marginBottom="8px">
        <AddNodeButton
          fromPartId={sourceNode.id}
          as="parent"
          toNodeType="fact"
          relation={{
            child: "source",
            name: "sourceOf",
            parent: "fact",
          }}
          selectNewNode={false}
        />
      </Stack>

      <Stack
        direction="row"
        justifyContent="center"
        alignItems="stretch"
        flexWrap="wrap"
        useFlexGap
        spacing="2px"
        marginBottom="8px"
      >
        {facts.length > 0 ? (
          facts.map((source) => <EditableNode key={source.id} node={source} supplemental />)
        ) : (
          <Typography>No facts yet!</Typography>
        )}
      </Stack>
    </>
  );
};
