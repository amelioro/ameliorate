import { ArrowBack, ArrowForward, Close, VerticalSplit } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { IconButton, Tab } from "@mui/material";
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
import { TopicViews } from "@/web/topic/components/TopicPane/TopicViews";
import {
  goBack,
  goForward,
  useCanGoBackForward,
  useSelectedGraphPart,
} from "@/web/view/selectedPartStore";

const DetailsToolbar = () => {
  const [canGoBack, canGoForward] = useCanGoBackForward();

  return (
    <div className="flex items-center justify-center">
      <IconButton
        color="inherit"
        title="Previous Selection"
        aria-label="Previous Selection"
        onClick={goBack}
        disabled={!canGoBack}
      >
        <ArrowBack />
      </IconButton>
      <IconButton
        color="inherit"
        title="Next Selection"
        aria-label="Next Selection"
        onClick={goForward}
        disabled={!canGoForward}
      >
        <ArrowForward />
      </IconButton>
    </div>
  );
};

type TopicTab = "Details" | "Views";
interface Props {
  anchor: "left" | "right" | "bottom";
  tabs: [TopicTab, ...TopicTab[]];
}

const TopicPaneBase = ({ anchor, tabs }: Props) => {
  const defaultOpen = anchor !== "bottom"; // don't open by default if we're on mobile because it takes up the whole screen
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

      {/* flex flex-col to put details toolbar above the content */}
      {/* overflow-auto to allow tab content to scroll */}
      {/* p-0 to allow tab content to manage its own padding, since e.g. dividers prefer not to be padded */}
      <TabPanel
        key="Details"
        value="Details"
        // flex to allow details to grow & fill up available space... but only if this tab is selected, because otherwise we override `TabPanel`'s default `display: hidden`
        className={"flex-col grow overflow-auto p-0" + (selectedTab === "Details" ? " flex" : "")}
      >
        {/* Toolbar centered above content to be near content's title, in hopes of implying that the */}
        {/* back/forward buttons are to navigate to previous/next content. */}
        <DetailsToolbar />

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

  return (
    /**
     * If we're anchored at the bottom, we're on mobile, and we want to show in front of the workspace content,
     * otherwise we want to appear in-line with workspace content.
     *
     * Note that we use `absolute` positioning with transform for animation regardless, because
     * animating the pane in/out, without squishing content due to width reducing/expanding, is hard
     * when actually positioning in-line.
     *
     * TODO?: could use `display: none` when not open, but also be aware that only 87% of users' browsers support @starting-style and transition-behavior
     */
    <div
      id={anchor === "left" ? "pane-left" : anchor === "right" ? "pane-right" : "pane-bottom"}
      className={
        // z-20 to be in front of node toolbar's z-10 in case we're viewing the summary and the summary node's toolbar is open
        "z-20 h-full absolute bg-paperShaded-main transition-transform duration-300" +
        (anchor !== "bottom" ? " w-[--drawer-min-width-rem]" : " w-full") +
        (anchor === "left" ? " border-r left-0" + (isOpen ? "" : " -translate-x-full") : "") +
        (anchor === "right" ? " border-l right-0" + (isOpen ? "" : " translate-x-full") : "") +
        (anchor === "bottom" ? " border-t bottom-0" + (isOpen ? "" : " translate-y-full") : "") +
        (isOpen ? " pane-open" : "")
      }
    >
      <IconButton
        color={isOpen ? undefined : "primary"} // stand out if pane is closed so it's easy to find, but if pane is open, the X doesn't really need to stand out
        title={isOpen ? "Close Topic Pane" : "View Topic Pane"}
        aria-label={isOpen ? "Close Topic Pane" : "View Topic Pane"}
        onClick={handlePaneToggle}
        className={
          "absolute z-10" +
          (anchor === "left" ? " right-0" + (isOpen ? "" : " translate-x-full") : "") +
          (anchor === "right" ? " left-0" + (isOpen ? "" : " -translate-x-full") : "") +
          (anchor === "bottom" ? " top-0 right-0" + (isOpen ? "" : " -translate-y-full") : "")
        }
      >
        {isOpen ? <Close /> : <VerticalSplit />}
      </IconButton>

      <div className="flex size-full flex-col">{paneContent}</div>
    </div>
  );
};

export const TopicPane = memo(TopicPaneBase, (prevProps, nextProps) =>
  deepIsEqual(prevProps, nextProps),
);
