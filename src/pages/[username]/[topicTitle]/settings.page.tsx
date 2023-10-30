import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import {
  NotFoundError,
  NotLoggedInError,
  QueryError,
} from "../../../web/common/components/Error/Error";
import { Loading } from "../../../web/common/components/Loading/Loading";
import { useSessionUser } from "../../../web/common/hooks";
import { trpc } from "../../../web/common/trpc";
import { EditTopicForm } from "../../../web/topic/components/TopicForm/TopicForm";

const TopicSettings: NextPage = () => {
  const router = useRouter();
  // Router only loads query params after hydration, so we can get undefined username here.
  // Value can't be string[] because not using catch-all "[...slug]".
  const username = router.query.username as string | undefined;
  const topicTitle = router.query.topicTitle as string | undefined;

  const { sessionUser, isLoading: sessionUserIsLoading } = useSessionUser();
  const findTopic = trpc.topic.findByUsernameAndTitle.useQuery(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- `enabled` guarantees non-null before query is run
    { username: username!, title: topicTitle! },
    { enabled: !!username && !!topicTitle }
  );

  // TODO: use suspense to better handle loading & error
  if (!router.isReady || !username || !topicTitle || findTopic.isLoading || sessionUserIsLoading)
    return <Loading />;
  // TODO: require loggedIn - add method similar to withPageAuthRequired, like withPageUserRequired
  if (!sessionUser) return <NotLoggedInError />;
  // not authorized
  if (username !== sessionUser.username) return <NotFoundError />;
  // server error
  if (findTopic.error) return <QueryError error={findTopic.error} />;
  // no topic to view
  if (!findTopic.data) return <NotFoundError />;

  return (
    <>
      <Head>
        <title>Topic settings | Ameliorate</title>
        <meta name="description" content="Update your topic settings." />
      </Head>

      <EditTopicForm topic={findTopic.data} user={sessionUser} />
    </>
  );
};

export default TopicSettings;
