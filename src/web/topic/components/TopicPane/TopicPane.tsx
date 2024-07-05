import {
  AutoStories,
  ChevronLeft,
  ChevronRight,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Tab } from "@mui/material";
import { useEffect, useState } from "react";

import { emitter } from "@/web/common/event";
import { GraphPartDetails } from "@/web/topic/components/TopicPane/GraphPartDetails";
import { TopicDetails } from "@/web/topic/components/TopicPane/TopicDetails";
import {
  Anchor,
  PositionedDiv,
  StyledDrawer,
  TogglePaneButton,
} from "@/web/topic/components/TopicPane/TopicPane.styles";
import { TopicViews } from "@/web/topic/components/TopicPane/TopicViews";
import { useSelectedGraphPart } from "@/web/view/currentViewStore/store";

const ANCHOR_ICON_MAP = {
  top: KeyboardArrowUp,
  left: ChevronLeft,
  bottom: KeyboardArrowDown,
  right: ChevronRight,
} as const;

type TopicTab = "Details" | "Views";
interface Props {
  anchor: Anchor;
  tabs: [TopicTab, ...TopicTab[]];
}

export const TopicPane = ({ anchor, tabs }: Props) => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedTab, setSelectedTab] = useState(tabs[0]);
  const selectedGraphPart = useSelectedGraphPart();

  useEffect(() => {
    if (!tabs.includes("Details")) return;

    const unbindView = emitter.on("viewTopicDetails", () => {
      setSelectedTab("Details");
      setIsOpen(true);
    });

    const unbindSelected = emitter.on("partSelected", (partId) => {
      if (partId) setSelectedTab("Details"); // convenient to show details when clicking a node, but don't open the pane if it's not open, because that can be jarring
    });

    return () => {
      unbindView();
      unbindSelected();
    };
  }, [tabs]);

  const handlePaneToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleTabChange = (_: React.SyntheticEvent, value: TopicTab) => {
    setSelectedTab(value);
  };

  const ToggleIcon = isOpen ? ANCHOR_ICON_MAP[anchor] : AutoStories;

  const TabPanelContent = {
    Details:
      selectedGraphPart !== null ? (
        <GraphPartDetails graphPart={selectedGraphPart} key={selectedGraphPart.id} />
      ) : (
        <TopicDetails />
      ),
    Views: <TopicViews />,
  };

  return (
    <PositionedDiv>
      <TogglePaneButton onClick={handlePaneToggle} color="primary" anchor={anchor}>
        <ToggleIcon />
      </TogglePaneButton>
      <StyledDrawer variant="permanent" open={isOpen} anchor={anchor}>
        <TabContext value={selectedTab}>
          <TabList onChange={handleTabChange} centered>
            {tabs.map((tab, idx) => (
              <Tab key={`${tab}_${idx}`} label={tab} value={tab} />
            ))}
          </TabList>
          {tabs.map((tab, idx) => (
            <TabPanel key={`${tab}_${idx}`} value={tab}>
              {TabPanelContent[tab]}
            </TabPanel>
          ))}
        </TabContext>
      </StyledDrawer>
    </PositionedDiv>
  );
};
