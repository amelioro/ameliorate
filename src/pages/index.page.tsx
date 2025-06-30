import type { NextPage } from "next";
import Head from "next/head";

import { useShowBanner } from "@/web/common/components/SiteBanner/bannerStore";
import { ConcludingSection } from "@/web/home/ConcludingSection";
import { CoreIdeasSection } from "@/web/home/CoreIdeasSection";
import { ExamplesSection } from "@/web/home/ExamplesSection";
import { FeaturesSection } from "@/web/home/FeaturesSection";
import { Footer } from "@/web/home/Footer";
import { Headline } from "@/web/home/Headline";
import { ImprovingSection } from "@/web/home/ImprovingSection";
import { UseCasesSection } from "@/web/home/UseCasesSection";

const Home: NextPage = () => {
  const showBanner = useShowBanner();

  // scroll-mt-12 to allow sections, when scrolled to via anchor, to appear below the header (which is 48px or 3rem height)
  // if banner is showing, we need to double it, and add 22px if mobile because then the banner has two lines of text and is taller
  const scrollMarginTopClasses = showBanner ? "*:scroll-mt-28 sm:*:scroll-mt-24" : "*:scroll-mt-12";

  return (
    <>
      <Head>
        {/* not in _app.page.tsx because these shouldn't override the og tags on other pages */}
        {/* since we prefer to on title and link tags in most cases, to avoid duplication */}
        <meta property="og:title" content="Ameliorate" />
        <meta property="og:url" content="https://ameliorate.app/" />
      </Head>

      <div className={"flex w-full flex-col divide-y" + ` ${scrollMarginTopClasses}`}>
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
          id="examples"
          className={
            "flex justify-center odd:bg-paperPlain-main even:bg-paperShaded-main" +
            // allow carousel to stretch to 100vw without creating a horizontal scrollbar for seeing behind the vertical scrollbar
            " overflow-x-hidden"
          }
        >
          <div
            className={
              "w-full max-w-6xl px-4 py-8 sm:p-8" +
              // This section looks much better if it's all visible at once because it has an image
              // that's hard to understand if we can't see it all.
              // 48px is the height of the navbar to exclude.
              " max-h-[calc(100vh-48px)]"
            }
          >
            <ExamplesSection />
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

        <section
          id="use-cases"
          className="flex justify-center odd:bg-paperPlain-main even:bg-paperShaded-main"
        >
          <div className="w-full max-w-6xl px-4 py-8 sm:p-8">
            <UseCasesSection />
          </div>
        </section>

        <section
          id="improving"
          className="flex justify-center odd:bg-paperPlain-main even:bg-paperShaded-main"
        >
          <div className="w-full max-w-6xl px-4 py-8 sm:p-8">
            <ImprovingSection />
          </div>
        </section>

        <section
          id="concluding"
          className="flex justify-center odd:bg-paperPlain-main even:bg-paperShaded-main"
        >
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
