import { Typography } from "@mui/material";

import { useSessionUser } from "@/web/common/hooks";
import { AddNodeButtonGroup } from "@/web/topic/components/Node/AddNodeButtonGroup";
import { EditableNode } from "@/web/topic/components/Node/EditableNode";
import { NodeList } from "@/web/topic/components/TopicPane/NodeList";
import { useResearchNodes } from "@/web/topic/diagramStore/graphPartHooks";
import { useUserCanEditTopicData } from "@/web/topic/topicStore/store";
import { DirectedToRelationWithCommonality } from "@/web/topic/utils/edge";
import { Node } from "@/web/topic/utils/graph";

interface Props {
  node: Node;
}

// make work for topic (when no graphPart is passed)
export const DetailsResearchSection = ({ node }: Props) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const { questions, facts, sources } = useResearchNodes(node.id);

  // facts shouldn't show sources because they have a different specific section for sources
  const researchNodes =
    node.type !== "fact" ? [...questions, ...facts, ...sources] : [...questions, ...facts];

  // prettier-ignore
  const addableRelations: DirectedToRelationWithCommonality[] = (
    [
      { target: "question", name: "asksAbout", source: node.type, as: "target", commonality: "common" },
    ] as DirectedToRelationWithCommonality[]
  ).concat(
    // disallow facts and sources as relevant for other facts and sources, because that gets confusing
    node.type !== "fact" && node.type !== "source"
      ? [
          { target: "fact", name: "relevantFor", source: node.type, as: "target", commonality: "common" },
          { target: "source", name: "relevantFor", source: node.type, as: "target", commonality: "common" },
        ]
      : [],
  );

  return (
    <>
      {userCanEditTopicData && (
        <AddNodeButtonGroup
          fromNodeId={node.id}
          addableRelations={addableRelations}
          selectNewNode={false}
          className="mb-2"
        />
      )}

      <NodeList>
        {researchNodes.length > 0 ? (
          researchNodes.map((researchNode) => (
            <EditableNode key={researchNode.id} node={researchNode} />
          ))
        ) : (
          <Typography variant="body2">No research nodes yet!</Typography>
        )}
      </NodeList>
    </>
  );
};
