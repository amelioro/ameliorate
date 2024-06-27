import { Typography } from "@mui/material";

export const ToolsSection = () => {
  return (
    <div className="flex flex-col items-center">
      <Typography variant="h4">Organize, navigate, and discuss</Typography>
      <Typography variant="body1">(3 cards with titles and descriptions)</Typography>
      <Typography variant="body1">(clicking on card shows relevant gif below)</Typography>
      <Typography variant="h6">(card 1) Build views to focus on different aspects</Typography>
      <Typography variant="body1">(click between quick views)</Typography>
      <Typography variant="h6">(card 2) Move through complex diagrams</Typography>
      <Typography variant="body1">(flashlight mode)</Typography>
      <Typography variant="h6">(card 3) Quickly identify where you disagree</Typography>
      <Typography variant="body1">(click compare scores, show score pie)</Typography>
    </div>
  );
};
