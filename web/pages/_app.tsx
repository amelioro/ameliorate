import "../styles/globals.css";
import type { AppProps } from "next/app";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme({
  // used material color palettes to find complement https://material.io/design/color/the-color-system.html#tools-for-picking-colors
  // used material color tool to confirm accessibility (legibility) https://material.io/resources/color/#!/?view.left=1&view.right=1&primary.color=4ab74c&secondary.color=b74ab5
  // used mui-theme-creator to see the colors in action https://bareynol.github.io/mui-theme-creator/?firstName=&lastName=&email=&password=
  palette: {
    mode: "light",
    primary: {
      main: "#4ab74c", // green: good, optimistic, let's solve things
    },
    secondary: {
      main: "#b84ab6", // purple: truth, complementary to green
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}

export default MyApp;
