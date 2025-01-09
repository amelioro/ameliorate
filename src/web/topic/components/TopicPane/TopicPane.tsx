import {
  AutoStories,
  ChevronLeft,
  ChevronRight,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Tab } from "@mui/material";
import { memo, useEffect, useState } from "react";

import { deepIsEqual } from "@/common/utils";
import { emitter } from "@/web/common/event";
import {
  GraphPartDetails,
  DetailsTab as PartDetailsTab,
} from "@/web/topic/components/TopicPane/GraphPartDetails";
import {
  TopicDetails,
  DetailsTab as TopicDetailsTab,
} from "@/web/topic/components/TopicPane/TopicDetails";
import {
  Anchor,
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

const TopicPaneBase = ({ anchor, tabs }: Props) => {
  const [isOpen, setIsOpen] = useState(tabs.includes("Details") ? true : false); // Views is expected to be used less, so close it by default
  const [selectedTab, setSelectedTab] = useState(tabs[0]);

  const [selectedTopicDetailsTab, setSelectedTopicDetailsTab] = useState<TopicDetailsTab>("Basics");
  const [selectedPartDetailsTab, setSelectedPartDetailsTab] = useState<PartDetailsTab>("Basics");

  const selectedGraphPart = useSelectedGraphPart();

  useEffect(() => {
    if (!tabs.includes("Details")) return;

    const unbindSelectBasics = emitter.on("viewBasics", () => {
      setSelectedTab("Details");
      setSelectedPartDetailsTab("Basics");
      setIsOpen(true);
    });

    const unbindSelectJustification = emitter.on("viewJustification", () => {
      setSelectedTab("Details");
      setSelectedPartDetailsTab("Justification");
      setIsOpen(true);
    });

    const unbindSelectResearch = emitter.on("viewResearch", () => {
      setSelectedTab("Details");
      setSelectedPartDetailsTab("Research");
      setIsOpen(true);
    });

    const unbindSelectComments = emitter.on("viewComments", () => {
      setSelectedTab("Details");
      setSelectedPartDetailsTab("Comments");
      setIsOpen(true);
    });

    const unbindSelectedPart = emitter.on("partSelected", (partId) => {
      if (partId) setSelectedTab("Details"); // convenient to show details when clicking a node, but don't open the pane if it's not open, because that can be jarring
    });

    return () => {
      unbindSelectBasics();
      unbindSelectJustification();
      unbindSelectResearch();
      unbindSelectComments();
      unbindSelectedPart();
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
        <GraphPartDetails
          graphPart={selectedGraphPart}
          selectedTab={selectedPartDetailsTab}
          setSelectedTab={setSelectedPartDetailsTab}
          // use `key` to prevent details from being reused from previous part when a new one is selected
          key={selectedGraphPart.id}
        />
      ) : (
        <TopicDetails
          selectedTab={selectedTopicDetailsTab}
          setSelectedTab={setSelectedTopicDetailsTab}
        />
      ),
    Views: <TopicViews />,
  };

  return (
    <div
      className={
        // pt-12 to make room for the overlayed header.
        // Bg with border for the whole div instead of just the Drawer so that it doesn't look like
        // the diagram will show above the Drawer (for cases where the App Header isn't as wide as
        // the Drawer, e.g. when screen is big enough for anchoring right).
        "relative bg-paperShaded-main " +
        (anchor !== "bottom" ? " lg:pt-12" : "") +
        (anchor === "left" ? " border-r" : "") +
        (anchor === "right" ? " border-l" : "")
      }
    >
      <TogglePaneButton onClick={handlePaneToggle} color="primary" anchor={anchor}>
        <ToggleIcon />
      </TogglePaneButton>
      <StyledDrawer
        variant="permanent"
        open={isOpen}
        anchor={anchor}
        // z-auto because Pane should share space with other elements, so doesn't need to be in front
        PaperProps={{ className: "bg-inherit border-x-0 lg:border-t z-auto" }}
      >
        <TabContext value={selectedTab}>
          <TabList onChange={handleTabChange} centered>
            {tabs.map((tab) => (
              <Tab key={tab} label={tab} value={tab} />
            ))}
          </TabList>
          {tabs.map((tab) => (
            <TabPanel key={tab} value={tab}>
              {TabPanelContent[tab]}
            </TabPanel>
          ))}
        </TabContext>
      </StyledDrawer>
    </div>
  );
};

export const TopicPane = memo(TopicPaneBase, (prevProps, nextProps) =>
  deepIsEqual(prevProps, nextProps),
);
