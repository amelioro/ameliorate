import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "@mui/icons-material";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Topic } from "@prisma/client";
import Router from "next/router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { topicSchema, visibilityTypes } from "@/common/topic";
import { trpc } from "@/web/common/trpc";
import { setTopic } from "@/web/topic/store/topicActions";
import { generateBasicViews } from "@/web/view/quickViewStore/store";

export const CreateTopicForm = ({ creatorName }: { creatorName: string }) => {
  const utils = trpc.useContext();

  const createTopic = trpc.topic.create.useMutation({
    onSuccess: async (newTopic, variables) => {
      utils.topic.findByUsernameAndTitle.setData(
        { username: creatorName, title: variables.topic.title },
        newTopic,
      );

      utils.user.findByUsername.setData({ username: creatorName }, (oldUser) => {
        if (oldUser) return { ...oldUser, topics: [...oldUser.topics, newTopic] };
        return oldUser;
      });

      await Router.push(`/${creatorName}/${variables.topic.title}`);
    },
  });

  const onSubmit = (data: FormData) => {
    createTopic.mutate({
      topic: {
        title: data.title,
        description: data.description,
        visibility: data.visibility,
        allowAnyoneToEdit: data.allowAnyoneToEdit,
      },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any -- TODO: move generated quick views to backend
      quickViews: generateBasicViews() as any,
    });
  };

  return <TopicForm creatorName={creatorName} onSubmit={onSubmit} />;
};

export const EditTopicForm = ({ topic, creatorName }: { topic: Topic; creatorName: string }) => {
  const utils = trpc.useContext();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const updateTopic = trpc.topic.update.useMutation({
    onSuccess: (updatedTopic) => {
      // need to update the URL if we're changing from the topic's page in the app
      const url = new URL(window.location.href);
      const oldPath = `/${creatorName}/${topic.title}`;
      const newPath = `/${creatorName}/${updatedTopic.title}`;
      if (oldPath != newPath && url.pathname === oldPath) {
        // eslint-disable-next-line functional/immutable-data
        url.pathname = newPath;
        const newUrl = url.toString();
        // Tried updating URL without reloading page (via Router `shallow` and also tried `window.history.replaceState` https://github.com/vercel/next.js/discussions/18072#discussioncomment-109059),
        // but after doing that, when later updating query params e.g. by selecting a view, the page would reload.
        // So we're just accepting having to reload right away.
        void Router.push(newUrl);
      }

      // update topic in store e.g. if changing description and viewing topic details in pane
      setTopic(updatedTopic);

      // this endpoint returns all topics
      utils.user.findByUsername.setData({ username: creatorName }, (oldUser) => {
        if (oldUser) {
          return {
            ...oldUser,
            topics: oldUser.topics.map((oldTopic) => {
              if (oldTopic.id === updatedTopic.id) return updatedTopic;
              else return oldTopic;
            }),
          };
        }
        return oldUser;
      });

      // update old title query
      utils.topic.findByUsernameAndTitle.setData(
        { username: creatorName, title: topic.title },
        null,
      );

      // update new title query
      utils.topic.findByUsernameAndTitle.setData(
        { username: creatorName, title: updatedTopic.title },
        updatedTopic,
      );
    },
  });

  const deleteTopic = trpc.topic.delete.useMutation({
    onSuccess: async () => {
      await Router.push(`/${creatorName}`);

      // this endpoint returns all topics
      utils.user.findByUsername.setData({ username: creatorName }, (oldUser) => {
        if (oldUser) {
          return {
            ...oldUser,
            topics: oldUser.topics.filter((oldTopic) => oldTopic.id !== topic.id),
          };
        }
        return oldUser;
      });

      utils.topic.findByUsernameAndTitle.setData(
        { username: creatorName, title: topic.title },
        null,
      );
    },
  });

  const onSubmit = (data: FormData) => {
    updateTopic.mutate({
      id: topic.id,
      title: data.title,
      description: data.description,
      visibility: data.visibility,
      allowAnyoneToEdit: data.allowAnyoneToEdit,
    });
  };

  const DeleteSection = (
    <>
      <Divider />
      <Typography variant="h5">Danger Zone</Typography>
      <Button
        variant="contained"
        color="error"
        onClick={() => setDeleteDialogOpen(true)}
        sx={{ alignSelf: "flex-end" }}
      >
        Delete Topic
      </Button>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
      >
        <DialogTitle id="alert-dialog-title">
          Delete topic {creatorName}/{topic.title}?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="inherit"
            disabled={deleteTopic.isLoading}
            onClick={() => setDeleteDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleteTopic.isLoading}
            onClick={() => deleteTopic.mutate({ id: topic.id })}
          >
            Delete Topic
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );

  return (
    <TopicForm
      topic={topic}
      creatorName={creatorName}
      onSubmit={onSubmit}
      DeleteSection={DeleteSection}
    />
  );
};

// not sure if extracting the form schema here is a good pattern, but it was
// really annoying to have so much code to read through in the component
const formSchema = (utils: ReturnType<typeof trpc.useContext>, username: string, topic?: Topic) => {
  return z.object({
    title: topicSchema.shape.title.refine(
      async (title) => {
        if (title === topic?.title) return true;
        // hack to avoid API requests if title already isn't valid; related zod issues https://github.com/colinhacks/zod/issues/1606, https://github.com/colinhacks/zod/issues/1403
        if (!topicSchema.shape.title.safeParse(title).success) return true;

        const existingTopic = await utils.topic.findByUsernameAndTitle.fetch({
          username,
          title,
        });
        return !existingTopic;
      },
      (title) => ({ message: `Title ${title} is not available.` }),
    ),
    description: topicSchema.shape.description,
    visibility: topicSchema.shape.visibility,
    allowAnyoneToEdit: topicSchema.shape.allowAnyoneToEdit,
  });
};
type FormData = z.infer<ReturnType<typeof formSchema>>;

interface Props {
  topic?: Topic;
  creatorName: string;
  onSubmit: (data: FormData) => void;
  DeleteSection?: JSX.Element;
}

const TopicForm = ({ topic, creatorName, onSubmit, DeleteSection }: Props) => {
  const utils = trpc.useContext();

  const {
    control,
    reset,
    register,
    handleSubmit,
    watch,
    // TODO: isDirty bug: enter "test1" into title, press cancel, paste "test1" into title again, isDirty remains false until a second change is made
    formState: { errors, isDirty },
  } = useForm<FormData>({
    mode: "onBlur", // onChange seems better but probably would want to debounce api calls, which is annoying
    reValidateMode: "onBlur",
    resolver: zodResolver(formSchema(utils, creatorName, topic)),
    defaultValues: {
      title: topic?.title,
      description: topic?.description,
      visibility: topic?.visibility ?? "private", // prevent people from accidentally sharing something sensitive
      allowAnyoneToEdit: topic?.allowAnyoneToEdit ?? false,
    },
  });

  const topicTitle = watch("title");
  const visibility = watch("visibility");

  const newTopic = topic === undefined;

  return (
    <>
      <form
        onSubmit={(event) =>
          void handleSubmit((data) => {
            onSubmit(data);
            reset(data); // otherwise isDirty remains true after submit
          })(event)
        }
        style={{ display: "flex", justifyContent: "center" }}
      >
        <Stack spacing={2} sx={{ width: "600px", margin: 2 }}>
          <Typography variant="h4" sx={{ marginBottom: 2 }}>
            {newTopic ? "Create a new topic" : "Topic Settings"}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
            {/* TODO: shrink to width of username (this box takes up a lot of space in mobile) */}
            <TextField
              disabled
              required
              value={creatorName}
              label="Username"
              sx={{ flexShrink: 0 }}
            />
            <Typography variant="h5" sx={{ pt: "0.75rem" }}>
              /
            </Typography>
            <TextField
              {...register("title")}
              label="Title"
              error={!!errors.title}
              helperText={errors.title?.message}
              required
              sx={{ flexGrow: 1 }}
            />
          </Stack>

          {/* seems to function properly but throws "too many rerenders" in development; think we can just leave it til a fix comes https://github.com/mui/material-ui/issues/33081 */}
          <TextField
            {...register("description")}
            label="Description"
            error={!!errors.description}
            helperText={errors.description?.message}
            multiline
            maxRows={10}
          />

          <Stack direction="row">
            <TextField
              {...register("visibility")}
              label="Visibility"
              error={!!errors.visibility}
              helperText={errors.visibility?.message}
              required
              select
              value={visibility} // not sure why this is needed here but not on the title text field
            >
              {visibilityTypes.map((visibilityType) => (
                <MenuItem key={visibilityType} value={visibilityType}>
                  {visibilityType}
                </MenuItem>
              ))}
            </TextField>

            <Tooltip
              title={
                <span>
                  This determines who can view your topic.
                  <br />
                  <br />
                  Private: only you can view your topic (note: Ameliorate maintainers still have
                  access to any topic you save - you must use the playground if you want your topic
                  to be truly private).
                  <br />
                  <br />
                  Unlisted: anyone with the link can view your topic.
                  <br />
                  <br />
                  Public: anyone with the link can view your topic, but additionally your topic will
                  show up in your topic list, and it may show up in future topic-sharing
                  functionality, such as topic search.
                </span>
              }
              enterTouchDelay={0} // allow touch to immediately trigger
              leaveTouchDelay={Infinity} // touch-away to close on mobile, since message is long
            >
              <IconButton
                color="info"
                aria-label="Visibility info"
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
          </Stack>

          <Controller
            control={control}
            name="allowAnyoneToEdit"
            render={({ field }) => (
              <FormControlLabel
                label="Allow anyone to edit this topic"
                control={<Checkbox {...field} checked={field.value} />}
              />
            )}
          />

          <Typography variant="body2">
            View your topic at: ameliorate.app/{creatorName}/{topicTitle || "{title}"}
          </Typography>

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button onClick={() => reset()} disabled={!isDirty}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={!isDirty}>
              {newTopic ? "Create" : "Save"}
            </Button>
          </Stack>

          {DeleteSection}
        </Stack>
      </form>
    </>
  );
};
