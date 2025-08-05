import { Stack, Typography } from "@mui/material";

import { StandaloneEdge } from "@/web/topic/components/Edge/StandaloneEdge";
import { AddNodeButton } from "@/web/topic/components/Node/AddNodeButton";
import { EditableNode } from "@/web/topic/components/Node/EditableNode";
import { NodeList } from "@/web/topic/components/TopicPane/NodeList";
import { useQuestionDetails } from "@/web/topic/diagramStore/nodeTypeHooks";
import { Node, isNode } from "@/web/topic/utils/graph";

interface Props {
  questionNode: Node & { type: "question" };
}

export const QuestionDetails = ({ questionNode }: Props) => {
  const { partAskingAbout, answers } = useQuestionDetails(questionNode.id);

  return (
    <>
      {partAskingAbout ? (
        <div className="mt-2 flex flex-col items-center gap-0.5">
          <Typography variant="body1">Asks About</Typography>

          <div className="flex items-center justify-center">
            {isNode(partAskingAbout) ? (
              <EditableNode node={partAskingAbout} />
            ) : (
              <StandaloneEdge edge={partAskingAbout} />
            )}
          </div>
        </div>
      ) : (
        <></>
      )}

      <div className="mt-4 flex flex-col items-center gap-0.5">
        <Typography variant="body1">Potential Answers</Typography>

        <Stack direction="row" justifyContent="center" alignItems="center" marginBottom="8px">
          <AddNodeButton
            fromNodeId={questionNode.id}
            addableRelation={{
              child: "answer",
              name: "potentialAnswerTo",
              parent: "question",
              as: "child",
            }}
            selectNewNode={false}
          />
        </Stack>

        <NodeList>
          {answers.length > 0 ? (
            answers.map((answer) => <EditableNode key={answer.id} node={answer} />)
          ) : (
            <Typography variant="body2">No answers yet!</Typography>
          )}
        </NodeList>
      </div>
    </>
  );
};
