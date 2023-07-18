import { NextPage } from "next";
import Head from "next/head";

import { NotLoggedInError } from "../web/common/components/Error/Error";
import { Loading } from "../web/common/components/Loading/Loading";
import { useSessionUser } from "../web/common/hooks";
import { CreateTopicForm } from "../web/topic/components/TopicForm/TopicForm";

const NewTopic: NextPage = () => {
  const { sessionUser, isLoading: sessionUserIsLoading } = useSessionUser();

  if (sessionUserIsLoading) return <Loading />;
  if (!sessionUser) return <NotLoggedInError />;

  return (
    <>
      <Head>
        <title>Create topic | Ameliorate</title>
        <meta name="description" content="Create a topic to mutually understand with Ameliorate." />
      </Head>

      <CreateTopicForm user={sessionUser} />
    </>
  );
};

export default NewTopic;
