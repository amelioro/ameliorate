import { AutoStories, ChevronLeft, KeyboardArrowDown } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Tab } from "@mui/material";
import { create } from "zustand";

import {
  useActiveArguedDiagramPart,
  useActiveTableProblemNode,
  useSelectedGraphPart,
} from "../../../view/navigateStore";
import { GraphPartDetails } from "./GraphPartDetails";
import { TopicDetails } from "./TopicDetails";
import { PositionedDiv, StyledDrawer, TogglePaneButton } from "./TopicPane.styles";
import { TopicViews } from "./TopicViews";

interface PaneStoreState {
  isTopicPaneOpen: boolean;
  selectedTab: "Details" | "Views";
}

const initialState: PaneStoreState = {
  isTopicPaneOpen: true,
  selectedTab: "Details",
};

const usePaneStore = create<PaneStoreState>()(() => initialState);

const setIsTopicPaneOpen = (isTopicPaneOpen: boolean) => {
  usePaneStore.setState({ isTopicPaneOpen });
};

const setSelectedTab = (selectedTab: "Details" | "Views") => {
  usePaneStore.setState({ selectedTab });
};

export const viewDetails = () => {
  setIsTopicPaneOpen(true);
  setSelectedTab("Details");
};

interface Props {
  isLandscape: boolean;
}

export const TopicPane = ({ isLandscape }: Props) => {
  const { isTopicPaneOpen, selectedTab } = usePaneStore();

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
            <TabList
              onChange={(_, newValue: "Details" | "Views") => setSelectedTab(newValue)}
              centered
            >
              <Tab label="Details" value="Details" />
              <Tab label="Views" value="Views" />
            </TabList>

            <TabPanel value="Details">
              {selectedGraphPart !== null ? (
                // Key ensures that details components re-render, re-setting default values.
                // Could consider using a `viewingGraphPart` separate from selected so that graph
                // part details for parts outside of the shown diagram can be displayed, without
                // losing tracking of the selected part per diagram.
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

            <TabPanel value="Views">
              <TopicViews />
            </TabPanel>
          </TabContext>
        </StyledDrawer>
      </PositionedDiv>
    </>
  );
};
