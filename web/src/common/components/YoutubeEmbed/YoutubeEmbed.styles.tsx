import styled from "@emotion/styled";
import { Box } from "@mui/material";

export const StyledBox = styled(Box)`
  overflow: hidden;
  position: relative;
  width: 100%;

  // responsive up to 640x360
  max-width: 640px;
  padding-bottom: min(56.25%, 360px); // 16:9 aspect ratio https://stackoverflow.com/a/10441480

  iframe {
    border: 0;

    position: absolute;
    top: 0;
    left: 0;

    height: 100%; // determined via parent padding-bottom
    width: 100%;
  }
`;
