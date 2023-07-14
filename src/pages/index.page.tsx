import { ArrowDownward } from "@mui/icons-material";
import { Box, Button, Divider, Typography } from "@mui/material";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import NextLink from "next/link";

import comparingSolutions from "../../public/Comparing-Solutions.png";
import justifyingAndCritiquingClaims from "../../public/Justifying-And-Critiquing-Claims.png";
import mappingSolutionsToProblems from "../../public/Mapping-Solutions-To-Problems.png";
import { YoutubeEmbed } from "../web/common/components/YoutubeEmbed/YoutubeEmbed";
import { StyledBox, StyledCarousel } from "./index.style";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Home | Ameliorate</title>
        <meta
          name="description"
          content="Ameliorate is a tool that makes it easier to discuss and mutually understand tough problems."
        />
      </Head>

      <StyledBox>
        <Typography variant="h3" color="primary">
          Ameliorate
        </Typography>

        <Typography variant="h5">
          Understand ourselves. Understand each other. Grow together.
        </Typography>

        <Typography variant="body1">
          A tool for discussing and mutually understanding tough problems
        </Typography>

        <Box display="flex" margin="0.75rem">
          <Button variant="contained" LinkComponent={NextLink} href="/solve">
            Solve
          </Button>
          <Button
            variant="outlined"
            endIcon={<ArrowDownward />}
            href="#how-it-works"
            sx={{ marginLeft: "0.5rem" }}
          >
            See how it works
          </Button>
        </Box>
      </StyledBox>

      <Divider />

      <section id="how-it-works">
        <StyledBox>
          <Typography variant="h4">How it works</Typography>
          <StyledCarousel autoPlay={false} navButtonsAlwaysVisible={true}>
            <YoutubeEmbed embedId="yM8RrwQWeJc" />
            <Image
              src={mappingSolutionsToProblems}
              alt="mapping solutions to problems"
              fill
              sizes="(max-width: 1165px) 100vw, 1165px" // max-width of the carousel
            />
            <Image
              src={comparingSolutions}
              alt="comparing solutions"
              fill
              sizes="(max-width: 1165px) 100vw, 1165px"
            />
            <Image
              src={justifyingAndCritiquingClaims}
              alt="justifying and critiquing claims"
              fill
              sizes="(max-width: 1165px) 100vw, 1165px"
            />
          </StyledCarousel>
        </StyledBox>
      </section>
    </>
  );
};

export default Home;
