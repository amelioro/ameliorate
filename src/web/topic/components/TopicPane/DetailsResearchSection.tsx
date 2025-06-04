import { Stack, Typography } from "@mui/material";

import { AddNodeButton } from "@/web/topic/components/Node/AddNodeButton";
import { EditableNode } from "@/web/topic/components/Node/EditableNode";
import { NodeList } from "@/web/topic/components/TopicPane/NodeList";
import { useResearchNodes } from "@/web/topic/diagramStore/graphPartHooks";
import { Node } from "@/web/topic/utils/graph";

interface Props {
  node: Node;
}

// make work for topic (when no graphPart is passed)
export const DetailsResearchSection = ({ node }: Props) => {
  const { questions, facts, sources } = useResearchNodes(node.id);

  // facts shouldn't show sources because they have a different specific section for sources
  const researchNodes =
    node.type !== "fact" ? [...questions, ...facts, ...sources] : [...questions, ...facts];

  return (
    <>
      {/* spacing is the amount that centers the add buttons above the columns */}
      <Stack direction="row" justifyContent="center" alignItems="center" marginBottom="8px">
        <AddNodeButton
          fromPartId={node.id}
          as="child"
          toNodeType="question"
          relation={{
            child: "question",
            name: "asksAbout",
            parent: node.type,
          }}
          selectNewNode={false}
        />

        {/* disallow facts and sources as relevant for other facts and sources, because that gets confusing */}
        {node.type !== "fact" && node.type !== "source" && (
          <>
            <AddNodeButton
              fromPartId={node.id}
              as="child"
              toNodeType="fact"
              relation={{
                child: "fact",
                name: "relevantFor",
                parent: node.type,
              }}
              selectNewNode={false}
            />
            <AddNodeButton
              fromPartId={node.id}
              as="child"
              toNodeType="source"
              relation={{
                child: "source",
                name: "relevantFor",
                parent: node.type,
              }}
              selectNewNode={false}
            />
          </>
        )}
      </Stack>

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
