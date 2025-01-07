import type { NextPage } from "next";
import Head from "next/head";

import { ConcludingSection } from "@/web/home/ConcludingSection";
import { CoreIdeasSection } from "@/web/home/CoreIdeasSection";
import { FeaturesSection } from "@/web/home/FeaturesSection";
import { Footer } from "@/web/home/Footer";
import { Headline } from "@/web/home/Headline";
import { ImprovingSection } from "@/web/home/ImprovingSection";
import { UseCasesSection } from "@/web/home/UseCasesSection";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        {/* not in _app.page.tsx because these shouldn't override the og tags on other pages */}
        {/* since we prefer to on title and link tags in most cases, to avoid duplication */}
        <meta property="og:title" content="Ameliorate" />
        <meta property="og:url" content="https://ameliorate.app/" />
      </Head>

      <div className="flex w-full flex-col divide-y">
        {/* overflow-hidden to keep the background image from going into other sections */}
        <div className="flex justify-center overflow-hidden odd:bg-paperPlain-main even:bg-paperShaded-main">
          <div className="w-full max-w-6xl px-4 py-8 sm:p-8">
            <Headline />
          </div>
        </div>

        <div className="flex justify-center odd:bg-paperPlain-main even:bg-paperShaded-main">
          <div className="w-full max-w-6xl px-4 py-8 sm:p-8">
            <CoreIdeasSection />
          </div>
        </div>

        <div className="flex justify-center odd:bg-paperPlain-main even:bg-paperShaded-main">
          <div className="w-full max-w-6xl px-4 py-8 sm:p-8">
            <UseCasesSection />
          </div>
        </div>

        <div className="flex justify-center odd:bg-paperPlain-main even:bg-paperShaded-main">
          <div className="w-full max-w-6xl px-4 py-8 sm:p-8">
            <FeaturesSection />
          </div>
        </div>

        <div className="flex justify-center odd:bg-paperPlain-main even:bg-paperShaded-main">
          <div className="w-full max-w-6xl px-4 py-8 sm:p-8">
            <ImprovingSection />
          </div>
        </div>

        <div className="flex justify-center odd:bg-paperPlain-main even:bg-paperShaded-main">
          <div className="w-full max-w-6xl px-4 py-8 sm:p-8">
            <ConcludingSection />
          </div>
        </div>

        <div className="flex justify-center odd:bg-paperPlain-main even:bg-paperShaded-main">
          <div className="w-full max-w-6xl px-4 py-8 sm:p-8">
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
