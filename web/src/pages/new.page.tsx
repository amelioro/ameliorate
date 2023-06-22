import { Button, Stack, TextField, Typography } from "@mui/material";
import { NextPage } from "next";
import Head from "next/head";
import Router from "next/router";
import { useForm } from "react-hook-form";

import { apiClient } from "../common/apiClient";

interface FormData {
  title: string;
}

const NewTopic: NextPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    mode: "onBlur", // onChange seems better but probably would want to debounce api calls, which is annoying
    reValidateMode: "onBlur",
    // resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    await apiClient.TopicsController_create({ title: data.title }, undefined);
    void Router.push("solve");
  };

  return (
    <>
      <Head>
        <title>Create topic | Ameliorate</title>
        <meta name="description" content="Create a topic to mutually understand with Ameliorate." />
      </Head>

      <form
        onSubmit={(event) => void handleSubmit(onSubmit)(event)}
        style={{ display: "flex", justifyContent: "center" }}
      >
        <Stack spacing={1}>
          <Typography variant="h4">Create a new topic</Typography>
          <Stack direction="row" spacing={1}>
            <TextField disabled required value="keyserj" label="Username" />
            <Typography variant="h5" sx={{ pt: "0.75rem" }}>
              /
            </Typography>
            <TextField
              // How to reuse schema validation between back and front?
              // Seems like zod could be used for both, but it wouldn't make sense for zod to handle
              // the unique check, and react-hook-form doesn't support both a zod resolver and
              // custom validation per component (via register()).
              {...register("title", {
                minLength: 1,
                maxLength: 100,
                pattern: {
                  value: /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,99}$/i, // match github username rules but with repo name length, thanks https://github.com/shinnn/github-username-regex/blob/master/index.js
                  message:
                    "Title may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.",
                },
                validate: {
                  // TODO: also need to prevent topics that conflict with user endpoints?
                  unique: async (title) => {
                    // lol since we can't generate null for this, we can't validate uniqueness.
                    await apiClient.TopicsController_findByUsernameAndTitle({
                      // const topic = await apiClient.TopicsController_findByUsernameAndTitle({
                      params: {
                        username: "keyserj",
                        title,
                      },
                    });

                    return true;
                  },
                },
              })}
              label="Title"
              error={!!errors.title}
              // How to get this to wrap instead of increasing parent flex container size?
              // Could maybe set a max width on the form
              helperText={errors.title?.message}
              required // how to add the required asterisk but prevent browser from adding "please fill out this field" message? maybe it's fine
            />
          </Stack>
          <Button type="submit" variant="contained">
            Create Topic
          </Button>
        </Stack>
      </form>
    </>
  );
};

export default NewTopic;
