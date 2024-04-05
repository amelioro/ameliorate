import { Global } from "@emotion/react";
import { Box, useMediaQuery } from "@mui/material";

import { ContextMenu } from "../../../common/components/ContextMenu/ContextMenu";
import { useFormat } from "../../../view/navigateStore";
import { CriteriaTable } from "../CriteriaTable/CriteriaTable";
import { Diagram } from "../Diagram/Diagram";
import { TopicToolbar } from "../Surface/TopicToolbar";
import { TopicPane } from "../TopicPane/TopicPane";

export const TopicWorkspace = () => {
  const isLandscape = useMediaQuery("(orientation: landscape)");

  const format = useFormat();

  return (
    <>
      <TopicToolbar />

      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "auto",
          flexDirection: isLandscape ? "row" : "column-reverse",
        }}
      >
        <TopicPane isLandscape={isLandscape} />

        <Box height="100%" flex="1" position="relative">
          {format === "table" && (
            <Box width="100%" height="100%" position="absolute">
              <CriteriaTable />
            </Box>
          )}

          {format === "diagram" && (
            <Box
              width="100%"
              height="100%"
              position="absolute"
              sx={{ backgroundColor: "white" }} // diagrams default to transparent background specifically to allow claim tree to retain visual context of the view behind it
            >
              <Diagram />
            </Box>
          )}
        </Box>

        {/* prevents body scrolling when workspace is rendered*/}
        <Global styles={{ body: { overflow: "hidden" } }} />
      </Box>

      <ContextMenu />
    </>
  );
};
