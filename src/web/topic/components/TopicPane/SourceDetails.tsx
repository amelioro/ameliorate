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
  const { nodesRelevantFor, edgesRelevantFor, facts, sources } = useSourceDetails(sourceNode.id);
  const mentions = facts.concat(sources);

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
        <ListItemText primary="Mentions" />
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
        <AddNodeButton
          fromPartId={sourceNode.id}
          as="parent"
          toNodeType="source"
          relation={{
            child: "source",
            name: "mentions",
            parent: "source",
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
        {mentions.length > 0 ? (
          mentions.map((mentioned) => (
            <EditableNode key={mentioned.id} node={mentioned} supplemental />
          ))
        ) : (
          <Typography>No mentioned facts or sources yet!</Typography>
        )}
      </Stack>
    </>
  );
};
