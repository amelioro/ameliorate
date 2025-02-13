import { AutoStories, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { IconButton, Modal, Tab } from "@mui/material";
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
import { StyledDrawer, drawerMinWidthRem } from "@/web/topic/components/TopicPane/TopicPane.styles";
import { TopicViews } from "@/web/topic/components/TopicPane/TopicViews";
import { useSelectedGraphPart } from "@/web/view/selectedPartStore";

type TopicTab = "Details" | "Views";
interface Props {
  anchor: "left" | "right" | "modal";
  tabs: [TopicTab, ...TopicTab[]];
}

const TopicPaneBase = ({ anchor, tabs }: Props) => {
  const defaultOpen = anchor !== "modal" && tabs.includes("Details"); // Views is expected to be used less, so close it by default
  const [isOpen, setIsOpen] = useState(defaultOpen);
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

  const paneContent = (
    <TabContext value={selectedTab}>
      <TabList onChange={handleTabChange} centered>
        {tabs.map((tab) => (
          <Tab key={tab} label={tab} value={tab} />
        ))}
      </TabList>

      {/* overflow-auto to allow tab content to scroll */}
      {/* p-0 to allow tab content to manage its own padding, since e.g. dividers prefer not to be padded */}
      <TabPanel key="Details" value="Details" className="overflow-auto p-0">
        {selectedGraphPart !== null ? (
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
        )}
      </TabPanel>

      <TabPanel key="Views" value="Views" className="overflow-auto p-0">
        <TopicViews />
      </TabPanel>
    </TabContext>
  );

  return anchor !== "modal" ? (
    <div
      className={
        // pt-12 to make room for the overlayed header.
        // Bg with border for the whole div instead of just the Drawer so that it doesn't look like
        // the diagram will show above the Drawer (for cases where the App Header isn't as wide as
        // the Drawer, e.g. when screen is big enough for anchoring right).
        "relative bg-paperShaded-main lg:pt-12 " +
        (anchor === "left" ? " border-r" : "") +
        (anchor === "right" ? " border-l" : "")
      }
    >
      <IconButton
        onClick={handlePaneToggle}
        color="primary"
        className={
          "absolute z-10" +
          (anchor === "left" ? " right-0 translate-x-full" : " left-0 -translate-x-full")
        }
      >
        {isOpen ? anchor === "left" ? <ChevronLeft /> : <ChevronRight /> : <AutoStories />}
      </IconButton>
      <StyledDrawer
        variant="permanent"
        open={isOpen}
        anchor={anchor}
        // z-auto because Pane should share space with other elements, so doesn't need to be in front
        PaperProps={{ className: "bg-inherit border-x-0 lg:border-t z-auto" }}
      >
        {paneContent}
      </StyledDrawer>
    </div>
  ) : (
    <div className="absolute inset-0">
      <IconButton
        onClick={handlePaneToggle}
        color="primary"
        className={"absolute bottom-0 right-0 z-10"}
      >
        <AutoStories />
      </IconButton>
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        aria-label="Topic pane"
        className="flex items-center justify-center"
      >
        <div
          // flex to ensure content takes up no more than full height, allowing inner containers to control scrolling
          className="flex h-5/6 flex-col bg-paperPlain-main"
          style={{ width: `${drawerMinWidthRem}rem` }}
        >
          {paneContent}
        </div>
      </Modal>
    </div>
  );
};

export const TopicPane = memo(TopicPaneBase, (prevProps, nextProps) =>
  deepIsEqual(prevProps, nextProps),
);
