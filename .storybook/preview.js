import { Global } from "@emotion/react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import { getThemeOptions } from "../src/common/theme";
import { globals } from "../src/page_styles/_app.styles";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

// needs to match global/wrapping css established in _app.tsx
// see https://storybook.js.org/blog/material-ui-in-storybook/
const withMuiTheme = (Story) => {
  const theme = createTheme(getThemeOptions("light"));

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Story />
      </ThemeProvider>

      <Global styles={globals} />
    </>
  );
};

export const decorators = [withMuiTheme];
