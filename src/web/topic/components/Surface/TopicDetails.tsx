import { zodResolver } from "@hookform/resolvers/zod";
import { AutoStories, Settings } from "@mui/icons-material";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
} from "@mui/material";
import NextLink from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { topicSchema } from "../../../../common/topic";
import { Link } from "../../../common/components/Link";
import { useSessionUser } from "../../../common/hooks";
import { setTopicDetails } from "../../store/topicActions";
import { useTopic } from "../../store/topicHooks";
import { useUserCanEditTopicData } from "../../store/userHooks";

const formSchema = () => {
  return z.object({
    description: topicSchema.shape.description,
  });
};
type FormData = z.infer<ReturnType<typeof formSchema>>;

export const TopicDetails = () => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const topic = useTopic();
  const isPlaygroundTopic = topic.id === undefined;

  const {
    register,
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

  return (
    <form
      onBlur={(event) => {
        void handleSubmit((data) => {
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
        <ListItem disablePadding={false}>
          <TextField
            {...register("description")}
            label="Description"
            error={!!errors.description}
            helperText={errors.description?.message}
            multiline
            fullWidth
            maxRows={10}
            disabled={!userCanEditTopicData}
          />
        </ListItem>

        {!isPlaygroundTopic && userCanEditTopicData && (
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
      </List>
    </form>
  );
};
