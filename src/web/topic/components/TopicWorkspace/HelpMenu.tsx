import {
  AccountBalance,
  Campaign,
  Carpenter,
  Handyman,
  LocalLibrary,
  MenuBook,
} from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Divider, MenuItem, MenuItemProps, Tab } from "@mui/material";
import Link from "next/link";
import { Dispatch, SetStateAction, useState } from "react";

import { CloseOnClickMenuItem } from "@/web/common/components/ContextMenu/CloseOnClickMenuItem";
import { Menu } from "@/web/common/components/Menu/Menu";
import { useSessionUser } from "@/web/common/hooks";
import { docsPage, examplesPage, feedbackPage } from "@/web/common/urls";
import { useUserCanEditTopicData } from "@/web/topic/store/userHooks";
import { startTutorial } from "@/web/tutorial/tutorial";
import { useTutorialProgress } from "@/web/tutorial/tutorialStore";
import { Tutorial } from "@/web/tutorial/tutorialUtils";

type TutorialTab = "Builders" | "Viewers" | "Experts";

interface Props {
  helpAnchorEl: HTMLElement | null;
  setHelpAnchorEl: Dispatch<SetStateAction<HTMLElement | null>>;
}

export const HelpMenu = ({ helpAnchorEl, setHelpAnchorEl }: Props) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const { startedTutorials, completedTutorials } = useTutorialProgress();

  const [selectedTab, setSelectedTab] = useState<TutorialTab>(
    userCanEditTopicData ? "Builders" : "Viewers",
  );

  const helpMenuOpen = Boolean(helpAnchorEl);
  if (!helpMenuOpen) return;

  const TutorialMenuItem = (props: MenuItemProps) => {
    return <CloseOnClickMenuItem {...props} closeMenu={() => setHelpAnchorEl(null)} />;
  };

  const getProgressIcon = (tutorial: Tutorial) => {
    if (completedTutorials.includes(tutorial)) {
      return "✅";
    } else if (startedTutorials.includes(tutorial)) {
      return "🟧";
    }

    return "⬜";
  };

  return (
    <Menu
      className="[&_>_ul_>_*]:gap-x-2"
      anchorEl={helpAnchorEl}
      isOpen={helpMenuOpen}
      closeMenu={() => setHelpAnchorEl(null)}
      openDirection="top"
    >
      <Divider>Help</Divider>

      <MenuItem component={Link} href={docsPage} target="_blank">
        <MenuBook />
        Docs
      </MenuItem>
      <MenuItem component={Link} href={examplesPage} target="_blank">
        <AccountBalance />
        Examples
      </MenuItem>
      <MenuItem component={Link} href={feedbackPage} target="_blank">
        <Campaign />
        Give feedback
      </MenuItem>

      <Divider>Tutorials</Divider>

      <TabContext value={selectedTab}>
        <TabList
          onChange={(_, value: TutorialTab) => setSelectedTab(value)}
          centered
          className="px-2"
        >
          <Tab icon={<Carpenter />} label="Builders" value="Builders" />
          <Tab icon={<LocalLibrary />} label="Viewers" value="Viewers" />
          <Tab icon={<Handyman />} label="Experts" value="Experts" />
          {/* <Tab label="Builders" value="Builders" />
          <Tab label="Viewers" value="Viewers" />
          <Tab label="Experts" value="Experts" /> */}
        </TabList>

        {/* <TabPanel value="Builders" className="p-2">
          <TutorialMenuItem onClick={() => startTutorial("diagramBasics", "builders")}>
            {getProgressIcon("diagramBasics")} 1. Diagram basics
          </TutorialMenuItem>
          <TutorialMenuItem onClick={() => startTutorial("breakingDownAProblem", "builders")}>
            {getProgressIcon("breakingDownAProblem")} 2. Breaking down a problem
          </TutorialMenuItem>
          <TutorialMenuItem onClick={() => startTutorial("addingNuance", "builders")}>
            {getProgressIcon("addingNuance")} 3. Adding nuance
          </TutorialMenuItem>
          <TutorialMenuItem onClick={() => startTutorial("evaluatingTradeoffs", "builders")}>
            {getProgressIcon("evaluatingTradeoffs")} 4. Evaluating tradeoffs
          </TutorialMenuItem>
          <TutorialMenuItem onClick={() => startTutorial("buildingViews", "builders")}>
            {getProgressIcon("buildingViews")} 5. Building views
          </TutorialMenuItem>
        </TabPanel>

        <TabPanel value="Viewers" className="p-2">
          <TutorialMenuItem onClick={() => startTutorial("readingADiagram", "diagramViewers")}>
            {getProgressIcon("readingADiagram")} 1a. Reading a diagram
          </TutorialMenuItem>
          <TutorialMenuItem onClick={() => startTutorial("evaluatingTradeoffs", "tableViewers")}>
            {getProgressIcon("evaluatingTradeoffs")} 1b. Evaluating tradeoffs
          </TutorialMenuItem>
          <TutorialMenuItem onClick={() => startTutorial("navigatingATopic", "diagramViewers")}>
            {getProgressIcon("navigatingATopic")} 2. Navigating a topic
          </TutorialMenuItem>
        </TabPanel>

        <TabPanel value="Experts" className="p-2">
          <TutorialMenuItem disabled>More actions (coming later)</TutorialMenuItem>
          <TutorialMenuItem disabled>Advanced filtering (coming later)</TutorialMenuItem>
        </TabPanel> */}
      </TabContext>
    </Menu>
  );
};
