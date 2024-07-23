import type { NextPage } from "next";
import Head from "next/head";

import { ConcludingSection } from "@/web/home/ConcludingSection";
import { CoreIdeasSection } from "@/web/home/CoreIdeasSection";
import { FeaturesSection } from "@/web/home/FeaturesSection";
import { Footer } from "@/web/home/Footer";
import { Headline } from "@/web/home/Headline";
import { ImprovingSection } from "@/web/home/ImprovingSection";
import { UseCasesSection } from "@/web/home/UseCasesSection";

// influence Google Search to display search results with the name "Ameliorate" instead of ameliorate.app https://developers.google.com/search/docs/appearance/site-names#how-site-names-in-google-search-are-created
const siteNameJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Ameliorate",
  url: "https://ameliorate.app/",
};

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Home | Ameliorate</title>
        <meta
          name="description"
          content="Ameliorate is a tool for visualizing how you understand a problem."
        />
        <script type="application/ld+json">{JSON.stringify(siteNameJsonLd)}</script>
      </Head>

      <div className="flex w-full flex-col divide-y">
        {/* overflow-hidden to keep the background image from going into other sections */}
        <div className="flex justify-center overflow-hidden odd:bg-paper-main even:bg-gray-50">
          <div className="w-full max-w-6xl px-4 py-8 sm:p-8">
            <Headline />
          </div>
        </div>

        <div className="flex justify-center odd:bg-paper-main even:bg-gray-50">
          <div className="w-full max-w-6xl px-4 py-8 sm:p-8">
            <CoreIdeasSection />
          </div>
        </div>

        <div className="flex justify-center odd:bg-paper-main even:bg-gray-50">
          <div className="w-full max-w-6xl px-4 py-8 sm:p-8">
            <UseCasesSection />
          </div>
        </div>

        <div className="flex justify-center odd:bg-paper-main even:bg-gray-50">
          <div className="w-full max-w-6xl px-4 py-8 sm:p-8">
            <FeaturesSection />
          </div>
        </div>

        <div className="flex justify-center odd:bg-paper-main even:bg-gray-50">
          <div className="w-full max-w-6xl px-4 py-8 sm:p-8">
            <ImprovingSection />
          </div>
        </div>

        <div className="flex justify-center odd:bg-paper-main even:bg-gray-50">
          <div className="w-full max-w-6xl px-4 py-8 sm:p-8">
            <ConcludingSection />
          </div>
        </div>

        <div className="flex justify-center odd:bg-paper-main even:bg-gray-50">
          <div className="w-full max-w-6xl px-4 py-8 sm:p-8">
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
