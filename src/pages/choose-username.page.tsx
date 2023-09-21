import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Stack, TextField, Typography } from "@mui/material";
import Head from "next/head";
import Router from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { userSchema } from "../common/user";
import { Loading } from "../web/common/components/Loading/Loading";
import { useSessionUser } from "../web/common/hooks";
import { trpc } from "../web/common/trpc";

// not sure if extracting the queries into a method is a good pattern, but it was
// really annoying to have so much code to read through in the component
const useQueries = () => {
  const utils = trpc.useContext();
  const createUser = trpc.user.create.useMutation({
    onSuccess: (newUser, variables) => {
      utils.user.findByAuthId.setData({ authId: variables.authId }, newUser);

      const newUserWithTopics = { ...newUser, topics: [] };
      utils.user.findByUsername.setData({ username: variables.username }, newUserWithTopics);
      // setData triggers page re-render and will re-route
    },
  });

  return { createUser };
};

// not sure if extracting the form schema here is a good pattern, but it was
// really annoying to have so much code to read through in the component
const formSchema = (utils: ReturnType<typeof trpc.useContext>) => {
  return z.object({
    username: userSchema.shape.username.refine(
      async (username) => {
        // hack to avoid API requests if username already isn't valid; related zod issues https://github.com/colinhacks/zod/issues/1606, https://github.com/colinhacks/zod/issues/1403
        if (!userSchema.shape.username.safeParse(username).success) return true;

        const user = await utils.user.findByUsername.fetch({ username });
        return !user;
      },
      (username) => ({ message: `Username ${username} is not available.` })
    ),
  });
};
type FormData = z.infer<ReturnType<typeof formSchema>>;

const CreateUserPage = () => {
  const { authUser, sessionUser, checkSession, isLoading } = useSessionUser();
  const authId = authUser?.sub;

  const utils = trpc.useContext();
  const { createUser } = useQueries();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    mode: "onBlur", // onChange seems better but probably would want to debounce api calls, which is annoying
    reValidateMode: "onBlur",
    resolver: zodResolver(formSchema(utils)),
  });

  // allow user to verify email then refresh page
  useEffect(() => {
    const check = async () => {
      await fetch("/api/auth/refresh-profile");
      await checkSession();
    };
    void check();
  }, [checkSession]);

  if (isLoading) return <Loading />;

  if (!authUser || !authId) {
    void Router.push("/api/auth/login");
    return <Loading />;
  }

  if (!authUser.email_verified) {
    return (
      <Typography variant="h5" textAlign="center" sx={{ margin: 2 }}>
        An email was sent to verify your email address.
        <br />
        Please verify your email address, then refresh the page.
      </Typography>
    );
  }

  if (sessionUser) {
    // redirect away because user already exists
    void Router.push(`/${sessionUser.username}`);
    return <Loading />;
  }

  const onSubmit = (data: FormData) => {
    createUser.mutate({
      authId: authId,
      username: data.username,
    });
  };

  return (
    <>
      <Head>
        <title>Choose username | Ameliorate</title>
        <meta
          name="description"
          content="Choose your username to start solving problems with Ameliorate."
        />
      </Head>

      <form
        onSubmit={(event) => void handleSubmit(onSubmit)(event)}
        style={{ display: "flex", justifyContent: "center" }}
      >
        <Stack spacing={1} sx={{ width: "600px", textAlign: "center", margin: 1 }}>
          <Typography variant="h4">Choose your username</Typography>
          <Typography variant="body1">
            Your username is how other users will refer to you and find topics you create.
          </Typography>
          <TextField
            {...register("username")}
            label="Username"
            error={!!errors.username}
            helperText={errors.username?.message}
            required
          />
          <Button type="submit" variant="contained">
            Choose username
          </Button>
        </Stack>
      </form>
    </>
  );
};

export default CreateUserPage;
