import type { NextPage } from "next";
import Head from "next/head";

import { CoreIdeasSection } from "@/web/home/CoreIdeasSection";
import { Headline } from "@/web/home/Headline";
import { ImprovingSection } from "@/web/home/ImprovingSection";
import { ToolsSection } from "@/web/home/ToolsSection";
import { TopicsSection } from "@/web/home/TopicsSection";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Home | Ameliorate</title>
        <meta
          name="description"
          content="Ameliorate is a tool for conveying how you understand problems and solutions."
        />
      </Head>

      <div className="flex w-full justify-center">
        <div className="flex max-w-screen-2xl flex-col justify-center space-y-8 divide-y border p-8">
          <Headline />
          <ImprovingSection />
          <TopicsSection />
          <CoreIdeasSection />
          <ToolsSection />
        </div>
      </div>
    </>
  );
};

export default Home;
