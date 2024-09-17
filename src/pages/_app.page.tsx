import { UserProvider as AuthUserProvider } from "@auth0/nextjs-auth0/client";
import { Global } from "@emotion/react";
import CssBaseline from "@mui/material/CssBaseline";
import { StyledEngineProvider, ThemeProvider, createTheme } from "@mui/material/styles";
import { TourProvider } from "@reactour/tour";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";

import { globals } from "@/pages/_app.styles";
import Layout from "@/web/common/components/Layout";
import { getThemeOptions } from "@/web/common/theme";
import { trpc } from "@/web/common/trpc";
import "@/web/common/globals.css";

// influence Google Search to display search results with the name "Ameliorate" instead of ameliorate.app https://developers.google.com/search/docs/appearance/site-names#how-site-names-in-google-search-are-created
const siteNameJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Ameliorate",
  url: "https://ameliorate.app/",
};

// eslint-disable-next-line functional/no-let -- jank way to enable trpc queries outside of react tree, e.g. from zustand middleware https://github.com/trpc/trpc/discussions/2926#discussioncomment-5647033
export let trpcClient = null as unknown as ReturnType<typeof trpc.useContext>["client"];

const MyApp = ({ Component, pageProps }: AppProps) => {
  const theme = createTheme(getThemeOptions("light"));

  const utils = trpc.useContext();
  useEffect(() => {
    trpcClient = utils.client;
  }, [utils.client]);

  return (
    <>
      <Head>
        <title>Ameliorate</title>
        <meta
          name="description"
          content="Ameliorate is a tool for analyzing debatable problems effectively, collaboratively, and with an open mind."
        />

        <link rel="icon" href="/favicon.ico" />

        {/* https://mui.com/material-ui/getting-started/usage/#responsive-meta-tag */}
        <meta name="viewport" content="initial-scale=1, width=device-width" />

        <meta property="og:type" content="website" />

        {/* influence Google Search to display search results with the name "Ameliorate" instead of ameliorate.app https://developers.google.com/search/docs/appearance/site-names#how-site-names-in-google-search-are-created */}
        <meta property="og:site_name" content="Ameliorate" />
        <script type="application/ld+json">{JSON.stringify(siteNameJsonLd)}</script>
      </Head>

      {/* https://mui.com/material-ui/integrations/interoperability/#setup */}
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />

          <TourProvider
            steps={[]}
            showBadge={false}
            styles={{ maskWrapper: () => ({ display: "none" }) }}
            // super jank & brittle way to hide nav when there's only one step, because there's no exposed way for reactour do this...
            // also add padding to nav buttons so they're easier to click
            className="rounded-2xl border border-black !shadow-lg !shadow-black [&_>_div:nth-child(3):has(div_>_button:only-child)]:!hidden [&_>_div:nth-child(3)_button]:!p-1"
          >
            <AuthUserProvider>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </AuthUserProvider>
          </TourProvider>
        </ThemeProvider>
      </StyledEngineProvider>

      <Global styles={globals} />
    </>
  );
};

export default trpc.withTRPC(MyApp);
