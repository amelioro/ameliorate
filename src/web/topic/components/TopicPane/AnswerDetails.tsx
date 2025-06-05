import { Stack, Typography } from "@mui/material";

import { EditableNode } from "@/web/topic/components/Node/EditableNode";
import { useAnswerDetails } from "@/web/topic/diagramStore/nodeTypeHooks";
import { Node } from "@/web/topic/utils/graph";

interface Props {
  answerNode: Node & { type: "answer" };
}

export const AnswerDetails = ({ answerNode }: Props) => {
  const { question } = useAnswerDetails(answerNode.id);

  return (
    <div className="mt-2 flex flex-col items-center gap-0.5">
      <Typography variant="body1">Answer to</Typography>

      <Stack direction="row" justifyContent="center" alignItems="center">
        {question ? (
          <EditableNode node={question} />
        ) : (
          <Typography>No question to answer!</Typography>
        )}
      </Stack>
    </div>
  );
};
