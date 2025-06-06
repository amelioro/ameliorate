import { Stack, Typography } from "@mui/material";

import { StandaloneEdge } from "@/web/topic/components/Edge/StandaloneEdge";
import { AddNodeButton } from "@/web/topic/components/Node/AddNodeButton";
import { EditableNode } from "@/web/topic/components/Node/EditableNode";
import { NodeList } from "@/web/topic/components/TopicPane/NodeList";
import { useSourceDetails } from "@/web/topic/diagramStore/nodeTypeHooks";
import { Node } from "@/web/topic/utils/graph";

interface Props {
  sourceNode: Node & { type: "source" };
}

export const SourceDetails = ({ sourceNode }: Props) => {
  const { nodesRelevantFor, edgesRelevantFor, facts, sources } = useSourceDetails(sourceNode.id);
  const mentions = facts.concat(sources);

  return (
    <>
      <div className="mt-2 flex flex-col items-center gap-0.5">
        <Typography variant="body1">Relevant For</Typography>

        <NodeList>
          {nodesRelevantFor.length === 0 && edgesRelevantFor.length === 0 && (
            <Typography variant="body2">No relevant parts yet!</Typography>
          )}
          {nodesRelevantFor.length > 0 &&
            nodesRelevantFor.map((node) => <EditableNode key={node.id} node={node} />)}
          {edgesRelevantFor.length > 0 &&
            edgesRelevantFor.map((edge) => <StandaloneEdge key={edge.id} edge={edge} />)}
        </NodeList>
      </div>

      <div className="mt-4 flex flex-col items-center gap-0.5">
        <Typography variant="body1">Mentions</Typography>

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

        <NodeList>
          {mentions.length > 0 ? (
            mentions.map((mentioned) => <EditableNode key={mentioned.id} node={mentioned} />)
          ) : (
            <Typography variant="body2">No mentioned facts or sources yet!</Typography>
          )}
        </NodeList>
      </div>
    </>
  );
};
