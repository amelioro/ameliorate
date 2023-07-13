import { Global } from "@emotion/react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { AppProps, NextWebVitalsMetric } from "next/app";
import Head from "next/head";
import { GoogleAnalytics, event } from "nextjs-google-analytics";

import Layout from "../web/common/components/Layout";
import { getThemeOptions } from "../web/common/theme";
import { globals } from "./_app.styles";

// thanks https://github.com/MauricioRobayo/nextjs-google-analytics#web-vitals
export const reportWebVitals = (metric: NextWebVitalsMetric) => {
  event(metric.name, {
    category: metric.label === "web-vital" ? "Web Vitals" : "Next.js custom metric",
    value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value), // values must be integers
    label: metric.id, // id unique to current page load
    nonInteraction: true, // avoids affecting bounce rate.
  });
};

const MyApp = ({ Component, pageProps }: AppProps) => {
  const theme = createTheme(getThemeOptions("light"));

  return (
    <>
      <Head>
        <title>ameliorate</title>
        <meta name="description" content="Solve problems" />
        <link rel="icon" href="/favicon.ico" />

        {/* https://mui.com/material-ui/getting-started/usage/#responsive-meta-tag */}
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

      <GoogleAnalytics trackPageViews />

      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>

      <Global styles={globals} />
    </>
  );
};

export default MyApp;
