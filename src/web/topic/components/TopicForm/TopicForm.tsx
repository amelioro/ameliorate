import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Topic, User } from "@prisma/client";
import Router from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { topicSchema } from "../../../../common/topic";
import { trpc } from "../../../common/trpc";

export const CreateTopicForm = ({ user }: { user: User }) => {
  const utils = trpc.useContext();

  const createTopic = trpc.topic.create.useMutation({
    onSuccess: async (newTopic, variables) => {
      utils.topic.findByUsernameAndTitle.setData(
        { username: user.username, title: variables.title },
        newTopic
      );

      utils.user.findByUsername.setData({ username: user.username }, (oldUser) => {
        if (oldUser) return { ...oldUser, topics: [...oldUser.topics, newTopic] };
        return oldUser;
      });

      await Router.push(`/${user.username}/${variables.title}`);
    },
  });

  const onSubmit = (data: FormData) => {
    createTopic.mutate({
      title: data.title,
    });
  };

  return <TopicForm user={user} onSubmit={onSubmit} />;
};

export const EditTopicForm = ({ topic, user }: { topic: Topic; user: User }) => {
  const utils = trpc.useContext();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const updateTopic = trpc.topic.update.useMutation({
    onSuccess: async (updatedTopic, variables) => {
      await Router.push(`/${user.username}/${variables.title}/settings`);

      // this endpoint returns all topics
      utils.user.findByUsername.setData({ username: user.username }, (oldUser) => {
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
        { username: user.username, title: topic.title },
        null
      );

      // update new title query
      utils.topic.findByUsernameAndTitle.setData(
        { username: user.username, title: updatedTopic.title },
        updatedTopic
      );
    },
  });

  const deleteTopic = trpc.topic.delete.useMutation({
    onSuccess: async () => {
      await Router.push(`/${user.username}`);

      // this endpoint returns all topics
      utils.user.findByUsername.setData({ username: user.username }, (oldUser) => {
        if (oldUser) {
          return {
            ...oldUser,
            topics: oldUser.topics.filter((oldTopic) => oldTopic.id !== topic.id),
          };
        }
        return oldUser;
      });

      utils.topic.findByUsernameAndTitle.setData(
        { username: user.username, title: topic.title },
        null
      );
    },
  });

  const onSubmit = (data: FormData) => {
    updateTopic.mutate({
      id: topic.id,
      title: data.title,
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
          Delete topic {user.username}/{topic.title}?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={deleteTopic.isLoading} onClick={() => setDeleteDialogOpen(false)}>
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

  return <TopicForm topic={topic} user={user} onSubmit={onSubmit} DeleteSection={DeleteSection} />;
};

// not sure if extracting the form schema here is a good pattern, but it was
// really annoying to have so much code to read through in the component
const formSchema = (utils: ReturnType<typeof trpc.useContext>, user: User, topic?: Topic) => {
  return z.object({
    title: topicSchema.shape.title.refine(
      async (title) => {
        if (title === topic?.title) return true;
        // hack to avoid API requests if title already isn't valid; related zod issues https://github.com/colinhacks/zod/issues/1606, https://github.com/colinhacks/zod/issues/1403
        if (!topicSchema.shape.title.safeParse(title).success) return true;

        const existingTopic = await utils.topic.findByUsernameAndTitle.fetch({
          username: user.username,
          title,
        });
        return !existingTopic;
      },
      (title) => ({ message: `Title ${title} is not available.` })
    ),
  });
};
type FormData = z.infer<ReturnType<typeof formSchema>>;

interface Props {
  topic?: Topic;
  user: User;
  onSubmit: (data: FormData) => void;
  DeleteSection?: JSX.Element;
}

const TopicForm = ({ topic, user, onSubmit, DeleteSection }: Props) => {
  const utils = trpc.useContext();

  const {
    reset,
    register,
    handleSubmit,
    // TODO: isDirty bug: enter "test1" into title, press cancel, paste "test1" into title again, isDirty remains false until a second change is made
    formState: { errors, isDirty },
  } = useForm<FormData>({
    mode: "onBlur", // onChange seems better but probably would want to debounce api calls, which is annoying
    reValidateMode: "onBlur",
    resolver: zodResolver(formSchema(utils, user, topic)),
    defaultValues: {
      title: topic?.title,
    },
  });

  const newTopic = topic === undefined;

  return (
    <>
      <form
        onSubmit={(event) => void handleSubmit(onSubmit)(event)}
        style={{ display: "flex", justifyContent: "center" }}
      >
        <Stack spacing={1} sx={{ width: "600px" }}>
          <Typography variant="h4">{newTopic ? "Create a new topic" : "Topic Settings"}</Typography>
          <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
            {/* TODO: shrink to width of username (this box takes up a lot of space in mobile) */}
            <TextField
              disabled
              required
              value={user.username}
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
