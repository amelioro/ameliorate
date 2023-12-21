import styled from "@emotion/styled";
import { Box } from "@mui/material";
import Carousel from "react-material-ui-carousel";

export const StyledBox = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 5rem 0;
  text-align: center;
`;

export const StyledCarousel = styled(Carousel)`
  width: 90%;
  height: 100%;
  max-width: 1165px; // roughly the size of the local images used in the carousel
`;
