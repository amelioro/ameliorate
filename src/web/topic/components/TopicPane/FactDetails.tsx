import { Stack, Typography } from "@mui/material";

import { StandaloneEdge } from "@/web/topic/components/Edge/StandaloneEdge";
import { AddNodeButton } from "@/web/topic/components/Node/AddNodeButton";
import { EditableNode } from "@/web/topic/components/Node/EditableNode";
import { NodeList } from "@/web/topic/components/TopicPane/NodeList";
import { useFactDetails } from "@/web/topic/diagramStore/nodeTypeHooks";
import { Node } from "@/web/topic/utils/graph";

interface Props {
  factNode: Node & { type: "fact" };
}

export const FactDetails = ({ factNode }: Props) => {
  const { nodesRelevantFor, edgesRelevantFor, sources } = useFactDetails(factNode.id);

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
        <Typography variant="body1">Sources</Typography>

        <Stack direction="row" justifyContent="center" alignItems="center" marginBottom="8px">
          <AddNodeButton
            fromNodeId={factNode.id}
            addableRelation={{
              source: "source",
              name: "sourceOf",
              target: "fact",
              as: "source",
            }}
            selectNewNode={false}
          />
        </Stack>

        <NodeList>
          {sources.length > 0 ? (
            sources.map((source) => <EditableNode key={source.id} node={source} />)
          ) : (
            <Typography variant="body2">No sources yet!</Typography>
          )}
        </NodeList>
      </div>
    </>
  );
};
