import { zodResolver } from "@hookform/resolvers/zod";
import { Timeline } from "@mui/icons-material";
import { Divider, List, ListItem, ListItemIcon, ListItemText, TextField } from "@mui/material";
import lowerCase from "lodash/lowerCase";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { nodeSchema, researchNodeTypes } from "@/common/node";
import { useSessionUser } from "@/web/common/hooks";
import { StandaloneEdge } from "@/web/topic/components/Edge/StandaloneEdge";
import { EditableNode } from "@/web/topic/components/Node/EditableNode";
import { AnswerDetails } from "@/web/topic/components/TopicPane/AnswerDetails";
import { CommentSection } from "@/web/topic/components/TopicPane/CommentSection";
import { DetailsClaimsSection } from "@/web/topic/components/TopicPane/DetailsClaimsSection";
import { DetailsResearchSection } from "@/web/topic/components/TopicPane/DetailsResearchSection";
import { FactDetails } from "@/web/topic/components/TopicPane/FactDetails";
import { QuestionDetails } from "@/web/topic/components/TopicPane/QuestionDetails";
import { SourceDetails } from "@/web/topic/components/TopicPane/SourceDetails";
import { setGraphPartNotes } from "@/web/topic/store/actions";
import { useUserCanEditTopicData } from "@/web/topic/store/userHooks";
import { GraphPart, isNode, isNodeType } from "@/web/topic/utils/graph";
import { nodeDecorations } from "@/web/topic/utils/node";

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
        <div className="flex flex-col items-center">
          <ListItem disablePadding={false}>
            <ListItemIcon>
              <GraphPartIcon />
            </ListItemIcon>
            <ListItemText primary={headerText} />
          </ListItem>

          {partIsNode ? <EditableNode node={graphPart} /> : <StandaloneEdge edge={graphPart} />}

          <ListItem disablePadding={false} className="pt-3">
            <TextField
              {...register("notes")}
              label="Notes"
              error={!!errors.notes}
              helperText={errors.notes?.message}
              multiline
              fullWidth
              size="small"
              inputProps={{ className: "text-sm" }}
              InputLabelProps={{ className: "text-sm" }}
              maxRows={10}
              disabled={!userCanEditTopicData}
            />
          </ListItem>
        </div>

        {isNode(graphPart) && researchNodeTypes.includes(graphPart.type) && (
          <Divider className="my-1" />
        )}

        {isNodeType(graphPart, "question") && <QuestionDetails questionNode={graphPart} />}
        {isNodeType(graphPart, "answer") && <AnswerDetails answerNode={graphPart} />}
        {isNodeType(graphPart, "fact") && <FactDetails factNode={graphPart} />}
        {isNodeType(graphPart, "source") && <SourceDetails sourceNode={graphPart} />}

        <Divider className="my-1" />

        <DetailsClaimsSection graphPart={graphPart} />

        {/* prevent adding research nodes to edges; not 100% sure that we want to restrict this, but if it continues to seem good, this section can accept node instead of graphPart */}
        {partIsNode && (
          <>
            <Divider className="my-1" />
            <DetailsResearchSection node={graphPart} />
          </>
        )}

        <Divider className="my-1" />

        <CommentSection parentId={graphPart.id} parentType={partIsNode ? "node" : "edge"} />
      </List>
    </form>
  );
};
