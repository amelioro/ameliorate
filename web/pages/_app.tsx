import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { AppProps } from "next/app";
import Head from "next/head";

import LayoutMaterial from "../common/components/LayoutMaterial";
import { getThemeOptions } from "../common/theme";

function MyApp({ Component, pageProps }: AppProps) {
  const theme = createTheme(getThemeOptions("dark"));

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

        <LayoutMaterial>
          <Component {...pageProps} />
        </LayoutMaterial>
      </ThemeProvider>

      <style jsx global>{`
        a {
          color: inherit;
          text-decoration: none;
        }
      `}</style>
    </>
  );
}

export default MyApp;
