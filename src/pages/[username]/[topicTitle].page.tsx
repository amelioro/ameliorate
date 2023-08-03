import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { NotFoundError } from "../../web/common/components/Error/Error";
import { Loading } from "../../web/common/components/Loading/Loading";
import { trpc } from "../../web/common/trpc";
import { TopicWorkspace } from "../../web/topic/components/TopicWorkspace/TopicWorkspace";
import { populateFromApi } from "../../web/topic/store/loadActions";
import { HydrationContext } from "../_app.page";

// extract component so that it can use the store after hydration
const Page = () => {
  const router = useRouter();
  // Router only loads query params after hydration, so we can get undefined username here.
  // Value can't be string[] because not using catch-all "[...slug]".
  const username = router.query.username as string | undefined;
  const topicTitle = router.query.topicTitle as string | undefined;

  const getDiagram = trpc.topic.getData.useQuery(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- `enabled` guarantees non-null before query is run
    { username: username!, title: topicTitle! },
    { enabled: !!username && !!topicTitle, staleTime: Infinity }
  );

  useEffect(() => {
    if (!getDiagram.data) return;
    void populateFromApi(getDiagram.data);
  }, [getDiagram.data]);

  // TODO: use suspense to better handle loading & error
  if (!router.isReady || !username || !topicTitle || getDiagram.isLoading) return <Loading />;
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

const Topic: NextPage = () => {
  // required to prevent hydration mismatch with usage of zustand's persist middleware
  // see explanation in `useDiagramStoreAfterHydration`
  const [isHydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <HydrationContext.Provider value={isHydrated}>
      <Page />
    </HydrationContext.Provider>
  );
};

export default Topic;
