import { NextPage } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { NotFoundError, QueryError } from "../../web/common/components/Error/Error";
import { Loading } from "../../web/common/components/Loading/Loading";
import { useSessionUser } from "../../web/common/hooks";
import { trpc } from "../../web/common/trpc";
import { populateDiagramFromApi } from "../../web/topic/store/loadActions";
import { loadNavigateStore } from "../../web/view/navigateStore";
import { setInitialPerspective } from "../../web/view/perspectiveStore";

// Don't render the workspace server-side.
// Known reasons:
// - The Topic Drawer can render on the left or bottom depending on screen size, and it's jarring
// to render left on the server then shift after hydration to the bottom.
//
// Need to pass props type to dynamic for ts https://stackoverflow.com/a/69353026/8409296
const DynamicTopicWorkspace = dynamic<Record<string, never>>(
  () =>
    import("../../web/topic/components/TopicWorkspace/TopicWorkspace").then(
      (module) => module.TopicWorkspace
    ),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

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

  // Track populating so we don't render workspace (along with default values for components) with
  // old data before populating the store with fresh data.
  const [populatedFromApi, setPopulatedFromApi] = useState(false);

  useEffect(() => {
    // Check isFetching so we don't populate if we know we're just about to do so again.
    if (!getDiagram.data || getDiagram.isFetching) return;
    const diagramData = getDiagram.data;

    const populate = async () => {
      setPopulatedFromApi(false);
      populateDiagramFromApi(diagramData);
      await loadNavigateStore(`${diagramData.creatorName}/${diagramData.title}`);
      setPopulatedFromApi(true);
    };
    void populate();
  }, [getDiagram.data, getDiagram.isFetching]);

  useEffect(() => {
    const startingPerspective = sessionUser?.username ?? username;
    if (!startingPerspective) return;
    setInitialPerspective(startingPerspective);
  }, [sessionUser, username]);

  // TODO: use suspense to better handle loading & error
  // Additional check for isFetching for when client side navigation re-mounts but getDiagram was already loaded
  if (!router.isReady || !username || !topicTitle || getDiagram.isLoading || getDiagram.isFetching)
    return <Loading />;

  if (getDiagram.error) return <QueryError error={getDiagram.error} />;
  if (!getDiagram.data) return <NotFoundError />;

  // Separate this from the above loading check so that errors show on failed query
  if (!populatedFromApi) return <Loading />;

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

      <DynamicTopicWorkspace />
    </>
  );
};

export default Topic;
