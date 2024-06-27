import { Typography } from "@mui/material";

export const TopicsSection = () => {
  return (
    <div className="flex flex-col items-center">
      <Typography variant="h4">Explore topics</Typography>
      <Typography variant="body1">(four-column list on desktop, tabs on mobile)</Typography>
      <Typography variant="body1">(Examples, Fresh, Collaborative, Recently Updated)</Typography>
      <Typography variant="body1">
        (3x topics per category, just the clickable topic title)
      </Typography>
    </div>
  );
};
