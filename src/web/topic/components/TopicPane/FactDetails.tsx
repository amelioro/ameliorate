import { Code, Schema } from "@mui/icons-material";
import { ListItem, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";

import { StandaloneEdge } from "@/web/topic/components/Edge/StandaloneEdge";
import { AddNodeButton } from "@/web/topic/components/Node/AddNodeButton";
import { EditableNode } from "@/web/topic/components/Node/EditableNode";
import { useFactDetails } from "@/web/topic/store/nodeTypeHooks";
import { Node } from "@/web/topic/utils/graph";

interface Props {
  factNode: Node & { type: "fact" };
}

export const FactDetails = ({ factNode }: Props) => {
  const { nodesRelevantFor, edgesRelevantFor, sources } = useFactDetails(factNode.id);

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
          <Typography variant="body2">No relevant parts yet!</Typography>
        )}
        {nodesRelevantFor.length > 0 &&
          nodesRelevantFor.map((node) => <EditableNode key={node.id} node={node} />)}
        {edgesRelevantFor.length > 0 &&
          edgesRelevantFor.map((edge) => <StandaloneEdge key={edge.id} edge={edge} />)}
      </Stack>

      <ListItem disablePadding={false}>
        <ListItemIcon>
          <Code />
        </ListItemIcon>
        <ListItemText primary="Sources" />
      </ListItem>

      <Stack direction="row" justifyContent="center" alignItems="center" marginBottom="8px">
        <AddNodeButton
          fromPartId={factNode.id}
          as="child"
          toNodeType="source"
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
        {sources.length > 0 ? (
          sources.map((source) => <EditableNode key={source.id} node={source} />)
        ) : (
          <Typography variant="body2">No sources yet!</Typography>
        )}
      </Stack>
    </>
  );
};
