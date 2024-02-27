import { ArrowDownward } from "@mui/icons-material";
import { Box, Button, Divider, Link as MuiLink, Typography } from "@mui/material";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

import comparingSolutions from "../../public/Comparing-Solutions.png";
import justifyingAndCritiquingClaims from "../../public/Justifying-And-Critiquing-Claims.png";
import mappingSolutionsToProblems from "../../public/Mapping-Solutions-To-Problems.png";
import { Blog } from "../web/common/components/Blog.styles";
import { SubscribeForm } from "../web/common/components/SubscribeForm/SubscribeForm";
import { YoutubeEmbed } from "../web/common/components/YoutubeEmbed/YoutubeEmbed";
import { youtubeLivestreams } from "../web/common/urls";
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

      <Blog>
        <StyledBox flexDirection="column">
          <Box display="flex" flexDirection="column">
            <Typography variant="h3" color="primary">
              Ameliorate
            </Typography>

            <Typography variant="h5">
              Understand ourselves. Understand each other. Grow together.
            </Typography>

            <Typography variant="body1">
              A tool for discussing and mutually understanding tough problems
            </Typography>

            <Box display="flex" flexWrap="wrap" justifyContent="center" margin="0.75rem" gap={1}>
              <Button variant="contained" href="https://ameliorate.app/docs/getting-started">
                Get Started
              </Button>
              <Button variant="outlined" endIcon={<ArrowDownward />} href="#demo">
                Demo
              </Button>
            </Box>
          </Box>

          <Box
            display="flex"
            flexDirection="column"
            border="1px solid rgba(0,0,0,0.12)"
            borderRadius={1}
            marginTop={8}
          >
            <SubscribeForm
              header="Get progress updates"
              headerAnchor={<MuiLink href="https://amelioro.substack.com/">(blog)</MuiLink>}
              action="https://amelioro.substack.com/api/v1/free"
              buttonText="Subscribe"
            />

            <Divider />

            <SubscribeForm
              header="Get invited to future"
              headerAnchor={
                <MuiLink href="https://ameliorate.app/docs/discourse-sessions">
                  discourse sessions
                </MuiLink>
              }
              action="https://buttondown.email/api/emails/embed-subscribe/ameliorate-discourse"
              buttonText="Invite me"
            />
          </Box>
        </StyledBox>

        <Divider />

        <section id="demo">
          <StyledBox flexDirection="column">
            <Typography variant="h4">Demo</Typography>
            <Typography variant="body1">
              (more recent but unedited livestream demos are uploaded to
              <MuiLink href={youtubeLivestreams}>Ameliorate's YouTube channel</MuiLink>)
            </Typography>
            <StyledCarousel autoPlay={false} navButtonsAlwaysVisible={true}>
              <YoutubeEmbed embedId="q3kpbV90eOw" />
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
      </Blog>
    </>
  );
};

export default Home;
