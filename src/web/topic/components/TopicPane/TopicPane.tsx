import {
  AutoStories,
  ChevronLeft,
  ChevronRight,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Tab } from "@mui/material";

import { GraphPartDetails } from "@/web/topic/components/TopicPane/GraphPartDetails";
import { TopicDetails } from "@/web/topic/components/TopicPane/TopicDetails";
import {
  Anchor,
  PositionedDiv,
  StyledDrawer,
  TogglePaneButton,
} from "@/web/topic/components/TopicPane/TopicPane.styles";
import { TopicViews } from "@/web/topic/components/TopicPane/TopicViews";
import {
  setIsTopicPaneOpen,
  setSelectedTab,
  usePaneStore,
} from "@/web/topic/components/TopicPane/paneStore";
import { useSelectedGraphPart } from "@/web/view/currentViewStore/store";

const ANCHOR_ICON_MAP = {
  top: KeyboardArrowUp,
  left: ChevronLeft,
  bottom: KeyboardArrowDown,
  right: ChevronRight,
} as const;

interface Props {
  anchor: Anchor;
}

export const TopicPane = ({ anchor }: Props) => {
  const { isTopicPaneOpen, selectedTab } = usePaneStore();
  const selectedGraphPart = useSelectedGraphPart();

  const handlePaneToggle = () => {
    if (isTopicPaneOpen) {
      setIsTopicPaneOpen(false);
    } else {
      setIsTopicPaneOpen(true);
    }
  };

  const ToggleIcon = isTopicPaneOpen ? ANCHOR_ICON_MAP[anchor] : AutoStories;

  return (
    <PositionedDiv>
      <TogglePaneButton onClick={handlePaneToggle} color="primary" anchor={anchor}>
        <ToggleIcon />
      </TogglePaneButton>
      <StyledDrawer variant="permanent" open={isTopicPaneOpen} anchor={anchor}>
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
              <GraphPartDetails graphPart={selectedGraphPart} key={selectedGraphPart.id} />
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
  );
};
