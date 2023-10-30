import { zodResolver } from "@hookform/resolvers/zod";
import { Timeline } from "@mui/icons-material";
import { Divider, List, ListItem, ListItemIcon, ListItemText, TextField } from "@mui/material";
import lowerCase from "lodash/lowerCase";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { nodeSchema } from "../../../../common/node";
import { useSessionUser } from "../../../common/hooks";
import { setGraphPartNotes } from "../../store/actions";
import { useUserCanEditTopicData } from "../../store/userHooks";
import { GraphPart, isNode } from "../../utils/diagram";
import { nodeDecorations } from "../../utils/node";
import { StandaloneEdge } from "../Edge/StandaloneEdge";
import { EditableNode } from "../Node/EditableNode";

const formSchema = () => {
  return z.object({
    // same restrictions as edge, so we should be fine reusing node's schema
    notes: nodeSchema.shape.notes,
  });
};
type FormData = z.infer<ReturnType<typeof formSchema>>;

interface Props {
  graphPart: GraphPart;
}

export const GraphPartDetails = ({ graphPart }: Props) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    resolver: zodResolver(formSchema()),
    defaultValues: {
      notes: graphPart.data.notes,
    },
  });

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
          {partIsNode ? <EditableNode node={graphPart} /> : <StandaloneEdge edge={graphPart} />}
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
      </List>
    </form>
  );
};
