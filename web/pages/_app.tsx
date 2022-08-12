import "../styles/globals.css";
import type { AppProps } from "next/app";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Head from "next/head";
import { getThemeOptions } from "../common/theme";

function MyApp({ Component, pageProps }: AppProps) {
  const theme = createTheme(getThemeOptions("dark"));

  return (
    <>
      <Head>
        <meta name="description" content="Solve problems" />
        <link rel="icon" href="/favicon.ico" />

        {/* MUI fonts */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />

        {/* https://mui.com/material-ui/getting-started/usage/#responsive-meta-tag */}
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}

export default MyApp;
