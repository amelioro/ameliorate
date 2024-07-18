import { Global, useTheme } from "@emotion/react";
import { Box, useMediaQuery } from "@mui/material";
import { useTour } from "@reactour/tour";
import { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { ContextMenu } from "@/web/common/components/ContextMenu/ContextMenu";
import { CriteriaTable } from "@/web/topic/components/CriteriaTable/CriteriaTable";
import { Diagram } from "@/web/topic/components/Diagram/Diagram";
import { TopicToolbar } from "@/web/topic/components/Surface/TopicToolbar";
import { TopicPane } from "@/web/topic/components/TopicPane/TopicPane";
import { hotkeys } from "@/web/topic/utils/hotkeys";
import { toggleReadonlyMode } from "@/web/view/actionConfigStore";
import { setSelected, useFormat } from "@/web/view/currentViewStore/store";
import { setHasVisitedWorkspace, useHasVisitedWorkspace } from "@/web/view/userConfigStore";

const useWorkspaceHotkeys = () => {
  useHotkeys([hotkeys.deselectPart], () => setSelected(null));
  useHotkeys([hotkeys.readonlyMode], () => toggleReadonlyMode());
};

export const TopicWorkspace = () => {
  useWorkspaceHotkeys();

  const format = useFormat();
  const theme = useTheme();
  const isLandscape = useMediaQuery("(orientation: landscape)");
  const usingBigScreen = useMediaQuery(theme.breakpoints.up("2xl"));
  const useSplitPanes = isLandscape && usingBigScreen;

  const hasVisitedWorkspace = useHasVisitedWorkspace();
  const { setIsOpen: openTour } = useTour();

  useEffect(() => {
    if (!hasVisitedWorkspace) {
      openTour(true);
      setHasVisitedWorkspace();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- no need to check this beyond initial render; either open the tour or don't
  }, []);

  return (
    // hardcode workspace to take up full height of screen minus the navbar
    <div className="flex h-[calc(100svh-49px)] flex-col">
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
        <TopicPane
          anchor={isLandscape ? "left" : "bottom"}
          tabs={useSplitPanes ? ["Views"] : ["Details", "Views"]}
        />
        <Box height="100%" flex="1" overflow="auto">
          {format === "table" && <CriteriaTable />}
          {format === "diagram" && <Diagram />}
        </Box>
        {useSplitPanes && <TopicPane anchor="right" tabs={["Details"]} />}
        {/* prevents body scrolling when workspace is rendered*/}
        <Global styles={{ body: { overflow: "hidden" } }} />
      </Box>

      <ContextMenu />
    </div>
  );
};
