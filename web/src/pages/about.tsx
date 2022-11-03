import { Box, Divider, Link, Typography } from "@mui/material";
import type { NextPage } from "next";

import { PaperMiddle } from "../page_styles/about.styles";

const About: NextPage = () => {
  return (
    <>
      <Box display="flex" justifyContent="center">
        <PaperMiddle>
          <Typography variant="h5">What is this?</Typography>
          <Typography variant="body1">
            This is a problem-solving tool that focuses on reaching shared understandings.
          </Typography>

          <Typography variant="body1">
            Its purpose is to help reason around hard decisions, and to enable that reasoning to be
            shared, mutually understood, and improved. The core idea is that you can map pieces of
            solutions to pieces of problems, compare the tradeoffs of each solution, and everything
            that you're claiming implicitly (e.g. this piece of the problem is the most important
            thing to solve, this piece of the solution solves that problem) can clearly be justified
            and critiqued, in an off-to-the-side but easy-to-access way.
          </Typography>

          <Typography variant="body1">
            Disagreements should come down to differences in human/moral values, whereas right now
            they're often rooted in misunderstanding.
          </Typography>

          <Typography variant="body1">
            When such same-pagedness is QED, the ultimate dream is to enhance the tool in order to
            enable any individual to gain traction on or contribute to solving any problem with
            <i> minutes </i> of effort, even if the problem is a mountain. This will require
            features for scaling collaboration and tracking ongoing efforts.
          </Typography>

          <Divider />

          <Typography variant="h5">Vision</Typography>
          <Typography variant="body1">Imagine a world where...</Typography>
          <Typography variant="body1">
            ... you never had to leave a conversation frustrated that you weren't understood, or
            that you couldn't understand someone else.
          </Typography>

          <Typography variant="body1">
            ... politicians and citizens of diverse perspectives could work together and be
            satisfied with decisions intended to better society.
          </Typography>

          <Typography variant="body1">
            ... ANYONE has the power to get traction on an overwhelming problem.
          </Typography>

          <Divider />

          <Typography variant="h5">Mission</Typography>
          <Typography variant="body1">
            Enable humanity to effectively solve problems through understanding their own
            differences and reasonings.
          </Typography>

          <Divider />

          <Typography variant="h5">Roadmap</Typography>
          <Link
            href="https://miro.com/app/board/uXjVODhExZM=/?share_link_id=328679592737"
            target="_blank"
            rel="noopener"
          >
            https://miro.com/app/board/uXjVODhExZM=/?share_link_id=328679592737
          </Link>

          <Divider />

          <Typography variant="h5">UI Designs</Typography>
          <Link
            href="https://www.figma.com/file/bYNA5pVNoaoWboh6TyBTkb/Understandings---sketches"
            target="_blank"
            rel="noopener"
          >
            https://www.figma.com/file/bYNA5pVNoaoWboh6TyBTkb/Understandings---sketches
          </Link>
        </PaperMiddle>
      </Box>
    </>
  );
};

export default About;
