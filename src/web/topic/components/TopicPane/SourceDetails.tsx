import { Typography } from "@mui/material";

import { useSessionUser } from "@/web/common/hooks";
import { StandaloneEdge } from "@/web/topic/components/Edge/StandaloneEdge";
import { AddNodeButtonGroup } from "@/web/topic/components/Node/AddNodeButtonGroup";
import { EditableNode } from "@/web/topic/components/Node/EditableNode";
import { NodeList } from "@/web/topic/components/TopicPane/NodeList";
import { useSourceDetails } from "@/web/topic/diagramStore/nodeTypeHooks";
import { useUserCanEditTopicData } from "@/web/topic/topicStore/store";
import { Node } from "@/web/topic/utils/graph";

interface Props {
  sourceNode: Node & { type: "source" };
}

export const SourceDetails = ({ sourceNode }: Props) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

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

        {userCanEditTopicData && (
          <AddNodeButtonGroup
            fromNodeId={sourceNode.id}
            // prettier-ignore
            addableRelations={[
              { child: "source", name: "sourceOf", parent: "fact", as: "parent", commonality: "common" },
              { child: "source", name: "mentions", parent: "source", as: "parent", commonality: "common" },
            ]}
            selectNewNode={false}
            className="mb-2"
          />
        )}

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
