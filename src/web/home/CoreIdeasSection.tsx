import { Typography } from "@mui/material";

export const CoreIdeasSection = () => {
  return (
    <div className="flex flex-col items-center">
      <Typography variant="h4">Represent your understanding</Typography>
      <Typography variant="body1">(3 cards with titles and descriptions)</Typography>
      <Typography variant="body1">(clicking on card shows relevant image below)</Typography>
      <Typography variant="h6">(card 1) Build a diagram of problems or solutions</Typography>
      <Typography variant="body1">
        Break down a problem into causes and effects, and break down a solution into components,
        effects, and obstacles.
      </Typography>
      <Typography variant="h6">(card 2) Add nuance to your diagram</Typography>
      <Typography variant="body1">
        Blah blah scores, justification, questions, facts, sources
      </Typography>
      <Typography variant="h6">(card 3) ?</Typography>
      <Typography variant="body1">?</Typography>
    </div>
  );
};
