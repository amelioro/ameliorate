import { Box } from "@mui/material";
import { NextPage } from "next";

import Diagram from "../modules/diagram/components/Diagram/Diagram";

const Home: NextPage = () => {
  return (
    <>
      <Box width="100%" height="100%">
        <Diagram />
      </Box>
    </>
  );
};

export default Home;
