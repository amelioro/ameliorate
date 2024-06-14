import { Global } from "@emotion/react";
import { Box } from "@mui/material";

import { ContextMenu } from "@/web/common/components/ContextMenu/ContextMenu";
import { CriteriaTable } from "@/web/topic/components/CriteriaTable/CriteriaTable";
import { Diagram } from "@/web/topic/components/Diagram/Diagram";
import { TopicToolbar } from "@/web/topic/components/Surface/TopicToolbar";
import { TopicPane } from "@/web/topic/components/TopicPane/TopicPane";
import { useFormat } from "@/web/view/currentViewStore/store";

export const TopicWorkspace = () => {
  const format = useFormat();

  return (
    <>
      <TopicToolbar />

      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "auto",
        }}
      >
        <TopicPane />

        <Box height="100%" flex="1" overflow="auto">
          {format === "table" && <CriteriaTable />}
          {format === "diagram" && <Diagram />}
        </Box>

        {/* prevents body scrolling when workspace is rendered*/}
        <Global styles={{ body: { overflow: "hidden" } }} />
      </Box>

      <ContextMenu />
    </>
  );
};
