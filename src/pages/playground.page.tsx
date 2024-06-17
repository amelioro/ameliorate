import { NextPage } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useEffect, useState } from "react";

import { Loading } from "@/web/common/components/Loading/Loading";
import { loadStores } from "@/web/topic/loadStores";
import { playgroundUsername } from "@/web/topic/store/store";
import { setInitialPerspective } from "@/web/view/perspectiveStore";

// Don't render the workspace server-side.
// Known reasons:
// - The Topic Pane can render on the left or bottom depending on screen size, and it's jarring
// to render left on the server then shift after hydration to the bottom.
//
// Need to pass props type to dynamic for ts https://stackoverflow.com/a/69353026/8409296
const DynamicTopicWorkspace = dynamic<Record<string, never>>(
  // const DynamicTopicWorkspace = dynamic(
  () =>
    import("../web/topic/components/TopicWorkspace/TopicWorkspace").then(
      (module) => module.TopicWorkspace,
    ),
  {
    ssr: false,
    loading: () => <Loading />,
  },
);

const Playground: NextPage = () => {
  // Track populating so we don't render workspace (along with default values for components) with
  // old data before populating the store with fresh data.
  const [initiallyPopulated, setInitiallyPopulated] = useState(false);

  // must hydrate store after page is rendered, otherwise if hydration starts before page finishes
  // rendering, there will be a render mismatch between client and server
  useEffect(() => {
    const populate = async () => {
      await loadStores();
      setInitiallyPopulated(true);
    };
    void populate();
    setInitialPerspective(playgroundUsername);
  }, []);

  if (!initiallyPopulated) return <Loading />;

  return (
    <>
      <Head>
        <title>Solve problems | Ameliorate</title>
        <meta
          name="description"
          content="Ameliorate is a tool that makes it easier to solve tough problems. It helps you reason around hard decisions, and enables that reasoning to be shared and improved. Create your own problem map, and start solving today."
        />
      </Head>

      <DynamicTopicWorkspace />
    </>
  );
};

export default Playground;
