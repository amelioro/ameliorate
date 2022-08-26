import { Box, Divider, Paper, Typography } from "@mui/material";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <>
      <Box display="flex" justifyContent="center">
        <Paper sx={paper}>
          <Typography variant="h5">Between us all, we have the information.</Typography>
          <Typography variant="h5">
            We just need to be able to organize it, communicate it, improve it, and act on it.
          </Typography>

          <Divider />

          <Typography variant="h4">Don't sit back any longer.</Typography>

          <Divider />

          <Box display="flex">
            <Box flex="1">
              <Typography variant="h5">Hot</Typography>
              <Typography variant="body1">Racism</Typography>
              <Typography variant="body1">School Shootings</Typography>
            </Box>
            <Box flex="1">
              <Typography variant="h5">New</Typography>
              <Typography variant="body1">Climate Change</Typography>
            </Box>
            <Box flex="1">
              <Typography variant="h5">Recently Visited</Typography>
              <Typography variant="body1">World Hunger</Typography>
              <Typography variant="body1">School Shootings</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

const paper = {
  width: "1080px",
  textAlign: "center",
  margin: "10px",
  padding: "10px",
};

export default Home;
