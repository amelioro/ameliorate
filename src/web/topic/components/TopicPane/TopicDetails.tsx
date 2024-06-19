import { zodResolver } from "@hookform/resolvers/zod";
import { AutoStories, Info, Settings, Visibility } from "@mui/icons-material";
import {
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  TextField,
  Tooltip,
} from "@mui/material";
import NextLink from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { topicSchema } from "@/common/topic";
import { WatchType, watchTypes } from "@/common/watch";
import { Link } from "@/web/common/components/Link";
import { useSessionUser } from "@/web/common/hooks";
import { trpc } from "@/web/common/trpc";
import { CommentSection } from "@/web/topic/components/TopicPane/CommentSection";
import { setTopicDetails } from "@/web/topic/store/topicActions";
import { useTopic } from "@/web/topic/store/topicHooks";
import { useUserCanEditTopicData, useUserIsCreator } from "@/web/topic/store/userHooks";

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

  const willShowWatch = !isPlaygroundTopic && !!sessionUser;
  const findWatch = trpc.watch.find.useQuery(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- non-playground topics will have an id
    { topicId: topic.id! },
    { enabled: willShowWatch },
  );
  const setWatch = trpc.watch.setWatch.useMutation({
    onSuccess: () => findWatch.refetch(),
  });
  const showWatch = willShowWatch && findWatch.isSuccess;

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

        {showWatch && (
          <ListItem disablePadding={false} sx={{ paddingTop: 1 }}>
            <ListItemIcon>
              <Visibility />
            </ListItemIcon>
            <TextField
              select
              label="Watch"
              value={findWatch.data?.type ?? "participatingOrMentions"}
              fullWidth
              size="small"
              onChange={(event) => {
                setWatch.mutate({ topicId: topic.id, type: event.target.value as WatchType });
              }}
            >
              {watchTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <Tooltip
              title={
                <span>
                  You will receive notifications if you're subscribed to a thread.
                  <br />
                  <br />
                  Your watch determines in which cases you automatically become subscribed to a
                  thread.
                  <br />
                  <br />
                  "participatingOrMentions" will subscribe you when you participate (comment) in a
                  thread (the "mentions" half is not implemented yet).
                  <br />
                  <br />
                  "all" will subscribe you to all new threads.
                  <br />
                  <br />
                  "ignore" will not subscribe you to any new threads.
                </span>
              }
              enterTouchDelay={0} // allow touch to immediately trigger
              leaveTouchDelay={Infinity} // touch-away to close on mobile, since message is long
            >
              <IconButton
                color="info"
                aria-label="Watch info"
                sx={{
                  // Don't make it look like clicking will do something, since it won't.
                  // Using a button here is an attempt to make it accessible, since the tooltip will show
                  // on focus.
                  cursor: "default",
                  alignSelf: "center",
                }}
              >
                <Info />
              </IconButton>
            </Tooltip>
          </ListItem>
        )}

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
            InputLabelProps={{ className: "text-sm" }}
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
