import { css } from "@emotion/react";
import styled from "@emotion/styled";

// Previously used MUI theme for all typography, but that impacted all MUI components that use typography,
// and the margin was only intended for areas of the app that are blog-like (lots of text).
export const Blog = styled.div`
  ${({ theme }) => {
    return css`
      & .MuiTypography-root {
        margin: ${theme.spacing(1)};
      }
    `;
  }}
`;
