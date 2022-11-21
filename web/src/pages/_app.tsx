import { Global } from "@emotion/react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { AppProps } from "next/app";
import Head from "next/head";

import Layout from "../common/components/Layout";
import { getThemeOptions } from "../common/theme";
import { globals } from "../page_styles/_app.styles";

function MyApp({ Component, pageProps }: AppProps) {
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

      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>

      <Global styles={globals} />
    </>
  );
}

export default MyApp;
