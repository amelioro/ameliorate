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

      {/* scroll-mt-12 to allow sections, when scrolled to via anchor, to appear below the header (which is 3rem height) */}
      <div className="flex w-full flex-col divide-y *:scroll-mt-12">
        {/* overflow-hidden to keep the background image from going into other sections */}
        <section className="flex justify-center overflow-hidden odd:bg-paperPlain-main even:bg-paperShaded-main">
          <div className="w-full max-w-6xl px-4 py-8 sm:p-8">
            <Headline />
          </div>
        </section>

        <section
          id="break-things-down"
          className="flex justify-center odd:bg-paperPlain-main even:bg-paperShaded-main"
        >
          <div className="w-full max-w-6xl px-4 py-8 sm:p-8">
            <CoreIdeasSection />
          </div>
        </section>

        <section
          id="features"
          className="flex justify-center odd:bg-paperPlain-main even:bg-paperShaded-main"
        >
          <div className="w-full max-w-6xl px-4 py-8 sm:p-8">
            <FeaturesSection />
          </div>
        </section>

        <section className="flex justify-center odd:bg-paperPlain-main even:bg-paperShaded-main">
          <div className="w-full max-w-6xl px-4 py-8 sm:p-8">
            <UseCasesSection />
          </div>
        </section>

        <section className="flex justify-center odd:bg-paperPlain-main even:bg-paperShaded-main">
          <div className="w-full max-w-6xl px-4 py-8 sm:p-8">
            <ImprovingSection />
          </div>
        </section>

        <section className="flex justify-center odd:bg-paperPlain-main even:bg-paperShaded-main">
          <div className="w-full max-w-6xl px-4 py-8 sm:p-8">
            <ConcludingSection />
          </div>
        </section>

        <section className="flex justify-center odd:bg-paperPlain-main even:bg-paperShaded-main">
          <div className="w-full max-w-6xl px-4 py-8 sm:p-8">
            <Footer />
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
