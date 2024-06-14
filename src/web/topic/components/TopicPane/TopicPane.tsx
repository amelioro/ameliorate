import { AutoStories, ChevronLeft, ChevronRight, KeyboardArrowDown } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Tab, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React, { ReactNode } from "react";

import { GraphPartDetails } from "@/web/topic/components/TopicPane/GraphPartDetails";
import { TopicDetails } from "@/web/topic/components/TopicPane/TopicDetails";
import {
  PositionedDiv,
  StyledDrawer,
  TogglePaneButton,
} from "@/web/topic/components/TopicPane/TopicPane.styles";
import { TopicViews } from "@/web/topic/components/TopicPane/TopicViews";
import {
  setIsDetailsOpen,
  setIsTopicPaneOpen,
  setIsViewsOpen,
  setSelectedTab,
  usePaneStore,
  useViewportWidth,
} from "@/web/topic/components/TopicPane/paneStore";
import { useSelectedGraphPart } from "@/web/view/currentViewStore/store";

const IconAnchorMap = {
  left: {
    open: ChevronLeft,
    close: AutoStories,
  },
  right: {
    open: ChevronRight,
    close: AutoStories,
  },
  bottom: {
    open: KeyboardArrowDown,
    close: AutoStories,
  },
};

interface DrawerProps {
  anchor: "left" | "right" | "bottom";
  isOpen: boolean;
  onToggleClick: () => void;
  children: ReactNode;
}

const TopicDrawer = ({ anchor, isOpen, onToggleClick, children }: DrawerProps) => {
  const ToggleIcon = isOpen ? IconAnchorMap[anchor].open : IconAnchorMap[anchor].close;
  const isLandscape = anchor === "right" || anchor === "left";
  return (
    <Box
      sx={{
        position: "absolute",
        inset: "0",
      }}
    >
      <PositionedDiv anchor={anchor}>
        <StyledDrawer variant="permanent" open={isOpen} anchor={anchor} isLandscape={isLandscape}>
          {children}
        </StyledDrawer>
        <TogglePaneButton color="primary" onClick={onToggleClick}>
          <ToggleIcon />
        </TogglePaneButton>
      </PositionedDiv>
    </Box>
  );
};

export const TopicPane = () => {
  const { isTopicPaneOpen, isViewsOpen, isDetailsOpen, selectedTab } = usePaneStore();
  const selectedGraphPart = useSelectedGraphPart();
  const isLandscape = useMediaQuery("(orientation: landscape)");
  const width = useViewportWidth();
  const theme = useTheme();
  const isWideScreen = width >= theme.breakpoints.values.lg;

  const handleToggle = () => {
    setIsTopicPaneOpen(!isTopicPaneOpen);
  };
  const toggleDetails = () => {
    setIsDetailsOpen(!isDetailsOpen);
  };
  const toggleView = () => {
    setIsViewsOpen(!isViewsOpen);
  };

  if (!isWideScreen || !isLandscape) {
    return (
      <TopicDrawer
        anchor={isLandscape ? "left" : "bottom"}
        isOpen={isTopicPaneOpen}
        onToggleClick={handleToggle}
      >
        <TabContext value={selectedTab}>
          <TabList
            onChange={(_, newValue: "Details" | "Views") => setSelectedTab(newValue)}
            centered
          >
            <Tab label="Details" value="Details" />
            <Tab label="Views" value="Views" />
          </TabList>
          <TabPanel value="Views">
            <TopicViews />
          </TabPanel>
          <TabPanel value="Details">
            {selectedGraphPart !== null ? (
              // Could consider using a `viewingGraphPart` separate from selected so that graph
              // part details for parts outside of the shown diagram can be displayed, without
              // losing tracking of the selected part per diagram.
              <GraphPartDetails graphPart={selectedGraphPart} key={selectedGraphPart.id} />
            ) : (
              <TopicDetails />
            )}
          </TabPanel>
        </TabContext>
      </TopicDrawer>
    );
  }

  return (
    <>
      <TopicDrawer anchor="left" isOpen={isDetailsOpen} onToggleClick={toggleDetails}>
        <TabContext value="Details">
          <TabList centered>
            <Tab label="Details" value="Details" />
          </TabList>
          <TabPanel value="Details">
            {selectedGraphPart !== null ? (
              <GraphPartDetails graphPart={selectedGraphPart} key={selectedGraphPart.id} />
            ) : (
              <TopicDetails />
            )}
          </TabPanel>
        </TabContext>
      </TopicDrawer>
      <TopicDrawer anchor="right" isOpen={isViewsOpen} onToggleClick={toggleView}>
        <TabContext value="Views">
          <TabList centered>
            <Tab label="Views" value="Views" />
          </TabList>
          <TabPanel value="Views">
            <TopicViews />
          </TabPanel>
        </TabContext>
      </TopicDrawer>
    </>
  );
};
