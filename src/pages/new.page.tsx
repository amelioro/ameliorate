import { NextPage } from "next";
import Head from "next/head";
import Router from "next/router";

import { Loading } from "@/web/common/components/Loading/Loading";
import { useSessionUser } from "@/web/common/hooks";
import { CreateTopicForm } from "@/web/topic/components/TopicForm/TopicForm";

const NewTopic: NextPage = () => {
  const { sessionUser, isLoading: sessionUserIsLoading } = useSessionUser();

  if (sessionUserIsLoading) return <Loading />;

  if (!sessionUser) {
    void Router.push(`/api/auth/login?returnTo=${encodeURIComponent("/new")}`);
    return <Loading />;
  }

  return (
    <>
      <Head>
        <title>Create topic | Ameliorate</title>
        <meta name="description" content="Create a topic to mutually understand with Ameliorate." />
      </Head>

      <CreateTopicForm creatorName={sessionUser.username} />
    </>
  );
};

export default NewTopic;
