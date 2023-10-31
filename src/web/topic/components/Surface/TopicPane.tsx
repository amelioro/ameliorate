import { AutoStories, ChevronLeft, KeyboardArrowDown } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Tab } from "@mui/material";
import { useState } from "react";

import { useSelectedGraphPart } from "../../store/graphPartHooks";
import { useActiveArguedDiagramPart, useActiveTableProblemNode } from "../../store/store";
import { GraphPartDetails } from "./GraphPartDetails";
import { TopicDetails } from "./TopicDetails";
import { PositionedDiv, StyledDrawer, TogglePaneButton } from "./TopicPane.styles";
import { TopicViews } from "./TopicViews";

interface Props {
  isLandscape: boolean;
}

export const TopicPane = ({ isLandscape }: Props) => {
  const [isTopicPaneOpen, setIsTopicPaneOpen] = useState(true);
  const [selectedTab, setSelectedTab] = useState("1");

  const selectedGraphPart = useSelectedGraphPart();
  const activeArguedDiagramPart = useActiveArguedDiagramPart();
  const activeTableProblemNode = useActiveTableProblemNode();

  const handlePaneToggle = () => {
    if (isTopicPaneOpen) {
      setIsTopicPaneOpen(false);
    } else {
      setIsTopicPaneOpen(true);
    }
  };

  const ToggleIcon = isTopicPaneOpen
    ? isLandscape
      ? ChevronLeft
      : KeyboardArrowDown
    : AutoStories;

  return (
    <>
      {/* div to enable menu button to be positioned to the right of the pane */}
      <PositionedDiv>
        <TogglePaneButton onClick={handlePaneToggle} color="primary" isLandscape={isLandscape}>
          <ToggleIcon />
        </TogglePaneButton>
        {/* `permanent` because `persistent` adds transitions that conflict with our styles */}
        <StyledDrawer
          variant="permanent"
          open={isTopicPaneOpen}
          anchor={isLandscape ? "left" : "bottom"}
          isLandscape={isLandscape}
        >
          <TabContext value={selectedTab}>
            <TabList onChange={(_, newValue: string) => setSelectedTab(newValue)} centered>
              <Tab label="Details" value="1" />
              <Tab label="Views" value="2" />
            </TabList>

            <TabPanel value="1">
              {selectedGraphPart !== undefined ? (
                // key ensures that details components re-render, re-setting default values
                <GraphPartDetails graphPart={selectedGraphPart} key={selectedGraphPart.id} />
              ) : activeArguedDiagramPart !== null ? (
                <GraphPartDetails
                  graphPart={activeArguedDiagramPart}
                  key={activeArguedDiagramPart.id}
                />
              ) : activeTableProblemNode !== null ? (
                <GraphPartDetails
                  graphPart={activeTableProblemNode}
                  key={activeTableProblemNode.id}
                />
              ) : (
                <TopicDetails />
              )}
            </TabPanel>

            <TabPanel value="2">
              <TopicViews />
            </TabPanel>
          </TabContext>
        </StyledDrawer>
      </PositionedDiv>
    </>
  );
};
