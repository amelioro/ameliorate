import { Box } from "@mui/material";
import { NextPage } from "next";

import { Diagram } from "../modules/diagram/components/Diagram/Diagram";
import { TopicPane } from "../modules/diagram/components/TopicPane/TopicPane";

const Home: NextPage = () => {
  return (
    <>
      <Box width="100%" height="100%">
        <TopicPane />
        <Diagram />
      </Box>
    </>
  );
};

export default Home;
