import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { NotFoundError } from "../../web/common/components/Error/Error";
import { Loading } from "../../web/common/components/Loading/Loading";
import { useSessionUser } from "../../web/common/hooks";
import { trpc } from "../../web/common/trpc";
import { TopicWorkspace } from "../../web/topic/components/TopicWorkspace/TopicWorkspace";
import { populateFromApi } from "../../web/topic/store/loadActions";
import { setPerspectives } from "../../web/view/store/store";

const Topic: NextPage = () => {
  const router = useRouter();
  // Router only loads query params after hydration, so we can get undefined username here.
  // Value can't be string[] because not using catch-all "[...slug]".
  const username = router.query.username as string | undefined;
  const topicTitle = router.query.topicTitle as string | undefined;

  const getDiagram = trpc.topic.getData.useQuery(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- `enabled` guarantees non-null before query is run
    { username: username!, title: topicTitle! },
    // Not using stale time because client-side navigation back to this page fires the useEffect again,
    // repopulating the store with old data (if the client changed data before navigating away & back).
    // So we'll just re-fire on page mount, should be fine.
    { enabled: !!username && !!topicTitle }
  );

  const { sessionUser } = useSessionUser();

  useEffect(() => {
    // Check isFetching so we don't populate if we know we're just about to do so again.
    if (!getDiagram.data || getDiagram.isFetching) return;
    void populateFromApi(getDiagram.data);
  }, [getDiagram.data, getDiagram.isFetching]);

  useEffect(() => {
    const startingPerspective = sessionUser?.username ?? username;
    if (!startingPerspective) return;
    setPerspectives([startingPerspective]);
  }, [sessionUser, username]);

  // TODO: use suspense to better handle loading & error
  // Additional check for isFetching for when client side navigation re-mounts but getDiagram was already loaded
  if (!router.isReady || !username || !topicTitle || getDiagram.isLoading || getDiagram.isFetching)
    return <Loading />;
  if (!getDiagram.isSuccess || !getDiagram.data) return <NotFoundError />;

  return (
    <>
      <Head>
        <title>
          {username}/{topicTitle} | Ameliorate
        </title>
        <meta
          name="description"
          content={`${username}/${topicTitle} - understand your topic better.`}
        />
      </Head>

      <TopicWorkspace />
    </>
  );
};

export default Topic;
