import { zodResolver } from "@hookform/resolvers/zod";
import { AutoStories, Settings } from "@mui/icons-material";
import {
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
} from "@mui/material";
import NextLink from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { topicSchema } from "../../../../common/topic";
import { Link } from "../../../common/components/Link";
import { useSessionUser } from "../../../common/hooks";
import { setTopicDetails } from "../../store/topicActions";
import { useTopic } from "../../store/topicHooks";
import { useUserCanEditTopicData, useUserIsCreator } from "../../store/userHooks";
import { CommentSection } from "./CommentSection";

const formSchema = () => {
  return z.object({
    description: topicSchema.shape.description,
  });
};
type FormData = z.infer<ReturnType<typeof formSchema>>;

export const TopicDetails = () => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);
  const userIsCreator = useUserIsCreator(sessionUser?.username);

  const topic = useTopic();
  const isPlaygroundTopic = topic.id === undefined;

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    resolver: zodResolver(formSchema()),
    defaultValues: {
      description: topic.description,
    },
  });

  useEffect(() => {
    // when notes changes from outside of form (e.g. undo/redo), make sure form is updated
    reset({ description: topic.description });
  }, [topic.description, reset]);

  return (
    <form
      onBlur={(event) => {
        void handleSubmit((data) => {
          if (topic.description === data.description) return;
          setTopicDetails(data.description);
        })(event);
      }}
    >
      <List>
        <ListItem disablePadding={false}>
          <ListItemIcon>
            <AutoStories />
          </ListItemIcon>
          <ListItemText
            primary={
              isPlaygroundTopic ? (
                "Playground Topic"
              ) : (
                <>
                  <Link href={`/${topic.creatorName}`}>{topic.creatorName}</Link> /{" "}
                  <Link href={`/${topic.creatorName}/${topic.title}`}>{topic.title}</Link>
                </>
              )
            }
          />
        </ListItem>
        <ListItem disablePadding={false} sx={{ paddingTop: 1 }}>
          <TextField
            {...register("description")}
            label="Description"
            error={!!errors.description}
            helperText={errors.description?.message}
            multiline
            fullWidth
            size="small"
            inputProps={{ className: "text-sm" }}
            maxRows={10}
            disabled={!userCanEditTopicData}
          />
        </ListItem>

        {!isPlaygroundTopic && userIsCreator && (
          <ListItem>
            <ListItemButton
              LinkComponent={NextLink}
              href={`/${topic.creatorName}/${topic.title}/settings`}
            >
              <ListItemIcon>
                <Settings />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>
          </ListItem>
        )}

        <Divider sx={{ my: 1 }} />

        <CommentSection parentId={null} parentType="topic" />
      </List>
    </form>
  );
};
