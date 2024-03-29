import { PriorityHigh, Schema } from "@mui/icons-material";
import { ListItem, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";

import { useQuestionDetails } from "../../store/nodeTypeHooks";
import { Node, isNode } from "../../utils/graph";
import { StandaloneEdge } from "../Edge/StandaloneEdge";
import { AddNodeButton } from "../Node/AddNodeButton";
import { EditableNode } from "../Node/EditableNode";

interface Props {
  questionNode: Node & { type: "question" };
}

export const QuestionDetails = ({ questionNode }: Props) => {
  const { partAskingAbout, answers } = useQuestionDetails(questionNode.id);

  return (
    <>
      {partAskingAbout ? (
        <>
          <ListItem disablePadding={false}>
            <ListItemIcon>
              <Schema />
            </ListItemIcon>
            <ListItemText primary="Asks About" />
          </ListItem>

          <Stack direction="row" justifyContent="center" alignItems="center">
            {isNode(partAskingAbout) ? (
              <EditableNode node={partAskingAbout} supplemental />
            ) : (
              <StandaloneEdge edge={partAskingAbout} />
            )}
          </Stack>
        </>
      ) : (
        <></>
      )}

      <ListItem disablePadding={false}>
        <ListItemIcon>
          <PriorityHigh />
        </ListItemIcon>
        <ListItemText primary="Potential Answers" />
      </ListItem>

      <Stack direction="row" justifyContent="center" alignItems="center" marginBottom="8px">
        <AddNodeButton
          fromPartId={questionNode.id}
          as="child"
          toNodeType="answer"
          relation={{
            child: "answer",
            name: "potentialAnswerTo",
            parent: "question",
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
        {answers.length > 0 ? (
          answers.map((answer) => <EditableNode key={answer.id} node={answer} supplemental />)
        ) : (
          <Typography>No answers yet!</Typography>
        )}
      </Stack>
    </>
  );
};
