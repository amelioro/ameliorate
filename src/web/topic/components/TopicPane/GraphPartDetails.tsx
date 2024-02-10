import { zodResolver } from "@hookform/resolvers/zod";
import { Timeline } from "@mui/icons-material";
import { Divider, List, ListItem, ListItemIcon, ListItemText, TextField } from "@mui/material";
import lowerCase from "lodash/lowerCase";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { exploreNodeTypes, nodeSchema } from "../../../../common/node";
import { useSessionUser } from "../../../common/hooks";
import { setGraphPartNotes } from "../../store/actions";
import { useUserCanEditTopicData } from "../../store/userHooks";
import { GraphPart, isNode, isNodeType } from "../../utils/graph";
import { nodeDecorations } from "../../utils/node";
import { StandaloneEdge } from "../Edge/StandaloneEdge";
import { EditableNode } from "../Node/EditableNode";
import { AnswerDetails } from "./AnswerDetails";
import { DetailsClaimsSection } from "./DetailsClaimsSection";
import { DetailsExploreSection } from "./DetailsExploreSection";
import { FactDetails } from "./FactDetails";
import { QuestionDetails } from "./QuestionDetails";
import { SourceDetails } from "./SourceDetails";

const formSchema = z.object({
  // same restrictions as edge, so we should be fine reusing node's schema
  notes: nodeSchema.shape.notes,
});
type FormData = z.infer<typeof formSchema>;

interface Props {
  graphPart: GraphPart;
}

export const GraphPartDetails = ({ graphPart }: Props) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: graphPart.data.notes,
    },
  });

  useEffect(() => {
    // when notes changes from outside of form (e.g. undo/redo), make sure form is updated
    reset({ notes: graphPart.data.notes });
  }, [graphPart.data.notes, reset]);

  const partIsNode = isNode(graphPart);
  const GraphPartIcon = partIsNode ? nodeDecorations[graphPart.type].NodeIcon : Timeline;
  const headerText = partIsNode
    ? `${nodeDecorations[graphPart.type].title} Node`
    : `"${lowerCase(graphPart.label)}" Edge`;

  return (
    <form
      onBlur={(event) => {
        void handleSubmit((data) => {
          if (graphPart.data.notes === data.notes) return;
          setGraphPartNotes(graphPart, data.notes);
        })(event);
      }}
    >
      <List>
        <ListItem disablePadding={false}>
          <ListItemIcon>
            <GraphPartIcon />
          </ListItemIcon>
          <ListItemText primary={headerText} />
        </ListItem>

        <Divider />

        <ListItem disablePadding={false} sx={{ justifyContent: "center" }}>
          {partIsNode ? (
            <EditableNode node={graphPart} supplemental />
          ) : (
            <StandaloneEdge edge={graphPart} />
          )}
        </ListItem>

        <Divider />

        <ListItem disablePadding={false}>
          <TextField
            {...register("notes")}
            label="Notes"
            error={!!errors.notes}
            helperText={errors.notes?.message}
            multiline
            fullWidth
            maxRows={10}
            disabled={!userCanEditTopicData}
          />
        </ListItem>

        {isNode(graphPart) && exploreNodeTypes.includes(graphPart.type) && <Divider />}

        {isNodeType(graphPart, "question") && <QuestionDetails questionNode={graphPart} />}
        {isNodeType(graphPart, "answer") && <AnswerDetails answerNode={graphPart} />}
        {isNodeType(graphPart, "fact") && <FactDetails factNode={graphPart} />}
        {isNodeType(graphPart, "source") && <SourceDetails sourceNode={graphPart} />}

        <Divider />

        <DetailsClaimsSection graphPart={graphPart} />

        <Divider />

        {/* prevent adding explore nodes to edges; not 100% sure that we want to restrict this, but if it continues to seem good, this section can accept node instead of graphPart */}
        {partIsNode && <DetailsExploreSection node={graphPart} />}
      </List>
    </form>
  );
};
