import { Box } from "@mui/material";
import { CircleLoader } from "react-spinners";

export const Loading = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
      <CircleLoader />
    </Box>
  );
};
