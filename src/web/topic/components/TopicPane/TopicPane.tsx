import { ArrowBack, ArrowForward, Close, VerticalSplit } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { IconButton, Tab } from "@mui/material";
import { memo, useEffect, useRef, useState } from "react";

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

/**
 * call attention to the pane if an action was expected to change it, but it didn't change (because it was already in the expected state)
 */
const flashOutlineIfElementDoesntChange = (element: HTMLElement | null) => {
  if (!element) return;

  // eslint-disable-next-line functional/no-let
  let elementChanged = false;
  const observer = new MutationObserver(() => (elementChanged = true));
  observer.observe(element, { attributes: true, childList: true, subtree: true });

  setTimeout(() => {
    if (!elementChanged) {
      element.classList.add("outline-yellow-400!");
      setTimeout(() => {
        element.classList.remove("outline-yellow-400!");
      }, 500);
    }
    observer.disconnect();
  }, 0); // 0s timeout makes this check async so that renderer can process state changes first if there are any
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
  const paneContentDivRef = useRef<HTMLDivElement>(null);

  const [selectedTopicDetailsTab, setSelectedTopicDetailsTab] = useState<TopicDetailsTab>("Basics");
  const [selectedPartDetailsTab, setSelectedPartDetailsTab] = useState<PartDetailsTab>("Basics");

  const selectedGraphPart = useSelectedGraphPart();

  // set up handlers for opening pane and/or tabs for topic details
  useEffect(() => {
    if (!tabs.includes("Details")) return;

    // helper
    const setTabs = (
      topicTab: TopicTab,
      partDetailsTab?: PartDetailsTab,
      topicDetailsTab?: TopicDetailsTab,
    ) => {
      if (partDetailsTab) setSelectedPartDetailsTab(partDetailsTab);
      if (topicDetailsTab) setSelectedTopicDetailsTab(topicDetailsTab);

      setSelectedTab(topicTab);
      setIsOpen(true);

      flashOutlineIfElementDoesntChange(paneContentDivRef.current);
    };

    const unbindSelectTopic = emitter.on("viewTopic", () => {
      setTabs("Details");
    });

    const unbindSelectBasics = emitter.on("viewBasics", () => {
      setTabs("Details", "Basics");
    });

    const unbindSelectJustification = emitter.on("viewJustification", () => {
      setTabs("Details", "Justification");
    });

    const unbindSelectResearch = emitter.on("viewResearch", () => {
      setTabs("Details", "Research");
    });

    const unbindSelectComments = emitter.on("viewComments", () => {
      setTabs("Details", "Comments");
    });

    const unbindSelectedPart = emitter.on("partSelected", (partId) => {
      if (partId) setSelectedTab("Details"); // convenient to show details when clicking a node, but don't open the pane if it's not open, because that can be jarring
    });

    return () => {
      unbindSelectTopic();
      unbindSelectBasics();
      unbindSelectJustification();
      unbindSelectResearch();
      unbindSelectComments();
      unbindSelectedPart();
    };
  }, [tabs]);

  // set up handlers for opening pane and/or tabs for topic views
  useEffect(() => {
    if (!tabs.includes("Views")) return;

    const unbindSeeViewSettings = emitter.on("seeViewSettings", () => {
      setSelectedTab("Views");
      setIsOpen(true);

      flashOutlineIfElementDoesntChange(paneContentDivRef.current);
    });

    return () => {
      unbindSeeViewSettings();
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
      {tabs.includes("Details") && (
        <TabPanel
          key="Details"
          value="Details"
          // flex to allow details to grow & fill up available space... but only if this tab is selected, because otherwise we override `TabPanel`'s default `display: hidden`
          // flex flex-col to put details toolbar above the content
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
      )}

      {tabs.includes("Views") && (
        <TabPanel key="Views" value="Views" className="overflow-auto p-0">
          <TopicViews />
        </TabPanel>
      )}
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
        (anchor !== "bottom" ? " w-(--drawer-min-width-rem)" : " w-full") +
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

      <div
        ref={paneContentDivRef}
        className={
          "flex size-full flex-col" +
          // allow drawing user attention to the pane e.g. if they click to open the pane but it's already open
          " outline-transparent outline-solid -outline-offset-4 transition-[outline-color] duration-500"
        }
      >
        {paneContent}
      </div>
    </div>
  );
};

export const TopicPane = memo(TopicPaneBase, (prevProps, nextProps) =>
  deepIsEqual(prevProps, nextProps),
);
