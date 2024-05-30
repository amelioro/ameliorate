import { QuestionMark } from "@mui/icons-material";
import { ListItem, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";

import { EditableNode } from "@/web/topic/components/Node/EditableNode";
import { useAnswerDetails } from "@/web/topic/store/nodeTypeHooks";
import { Node } from "@/web/topic/utils/graph";

interface Props {
  answerNode: Node & { type: "answer" };
}

export const AnswerDetails = ({ answerNode }: Props) => {
  const { question } = useAnswerDetails(answerNode.id);

  return (
    <>
      <ListItem disablePadding={false}>
        <ListItemIcon>
          <QuestionMark />
        </ListItemIcon>
        <ListItemText primary="Answer to" />
      </ListItem>

      <Stack direction="row" justifyContent="center" alignItems="center" marginBottom="8px">
        {question ? (
          <EditableNode node={question} supplemental />
        ) : (
          <Typography>No question to answer!</Typography>
        )}
      </Stack>
    </>
  );
};
