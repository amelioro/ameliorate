import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { nodeSchema } from "@/common/node";
import { useSessionUser } from "@/web/common/hooks";
import { AnswerDetails } from "@/web/topic/components/TopicPane/AnswerDetails";
import { FactDetails } from "@/web/topic/components/TopicPane/FactDetails";
import { QuestionDetails } from "@/web/topic/components/TopicPane/QuestionDetails";
import { SourceDetails } from "@/web/topic/components/TopicPane/SourceDetails";
import { setGraphPartNotes } from "@/web/topic/diagramStore/actions";
import { useUserCanEditTopicData } from "@/web/topic/topicStore/store";
import { GraphPart, isNodeType } from "@/web/topic/utils/graph";

const formSchema = z.object({
  // same restrictions as edge, so we should be fine reusing node's schema
  notes: nodeSchema.shape.notes,
});
type FormData = z.infer<typeof formSchema>;

interface Props {
  graphPart: GraphPart;
}

export const DetailsBasicsSection = ({ graphPart }: Props) => {
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

  return (
    <form
      onBlur={(event) => {
        void handleSubmit((data) => {
          if (graphPart.data.notes === data.notes) return;
          setGraphPartNotes(graphPart, data.notes);
        })(event);
      }}
      className="w-full"
    >
      <TextField
        {...register("notes")}
        label="Notes"
        error={!!errors.notes}
        helperText={errors.notes?.message}
        multiline
        fullWidth
        size="small"
        InputProps={{ className: "text-sm", readOnly: !userCanEditTopicData }}
        InputLabelProps={{ className: "text-sm" }}
        maxRows={10}
        className="px-1.5"
      />

      {/* Potentially these could be in another tab like "specific for this node type"...? */}
      {/* but these seem low-use anyway and more effort to organize optimally, so we'll just do this for now. */}
      {isNodeType(graphPart, "question") && <QuestionDetails questionNode={graphPart} />}
      {isNodeType(graphPart, "answer") && <AnswerDetails answerNode={graphPart} />}
      {isNodeType(graphPart, "fact") && <FactDetails factNode={graphPart} />}
      {isNodeType(graphPart, "source") && <SourceDetails sourceNode={graphPart} />}
    </form>
  );
};
