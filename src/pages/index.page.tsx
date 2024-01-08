import { ArrowDownward } from "@mui/icons-material";
import { Box, Button, Divider, Typography } from "@mui/material";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import NextLink from "next/link";

import comparingSolutions from "../../public/Comparing-Solutions.png";
import justifyingAndCritiquingClaims from "../../public/Justifying-And-Critiquing-Claims.png";
import mappingSolutionsToProblems from "../../public/Mapping-Solutions-To-Problems.png";
import { Blog } from "../web/common/components/Blog.styles";
import { Link } from "../web/common/components/Link";
import { SubscribeForm } from "../web/common/components/SubscribeForm/SubscribeForm";
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
              <Button variant="contained" LinkComponent={NextLink} href="/playground">
                Playground
              </Button>
              <Button variant="outlined" LinkComponent={NextLink} href="/examples">
                Examples
              </Button>
              <Button variant="outlined" endIcon={<ArrowDownward />} href="#how-it-works">
                See how it works
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
              headerAnchor={<Link href="https://amelioro.substack.com/">(blog)</Link>}
              action="https://amelioro.substack.com/api/v1/free"
              buttonText="Subscribe"
            />

            <Divider />

            <SubscribeForm
              header="Get invited to future"
              headerAnchor={
                <Link href="https://amelioro.substack.com/p/ameliorate-update-1824-a-place-for#§discourse-sessions">
                  discourse sessions
                </Link>
              }
              action="https://buttondown.email/api/emails/embed-subscribe/ameliorate-discourse"
              buttonText="Invite me"
            />
          </Box>
        </StyledBox>

        <Divider />

        <section id="how-it-works">
          <StyledBox flexDirection="column">
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
      </Blog>
    </>
  );
};

export default Home;
