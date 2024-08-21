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
import { docsPage, examplesPage, feedbackPage } from "@/web/common/urls";
import { startTour } from "@/web/tour/tour";
import { useTourProgress } from "@/web/tour/tourStore";
import { Tour } from "@/web/tour/tourUtils";

type TutorialTab = "Builders" | "Viewers" | "Experts";

interface Props {
  helpAnchorEl: HTMLElement | null;
  setHelpAnchorEl: Dispatch<SetStateAction<HTMLElement | null>>;
}

export const HelpMenu = ({ helpAnchorEl, setHelpAnchorEl }: Props) => {
  const { startedTours, completedTours } = useTourProgress();

  const [selectedTab, setSelectedTab] = useState<TutorialTab>("Builders");

  const helpMenuOpen = Boolean(helpAnchorEl);
  if (!helpMenuOpen) return;

  const TutorialMenuItem = (props: MenuItemProps) => {
    return <CloseOnClickMenuItem {...props} closeMenu={() => setHelpAnchorEl(null)} />;
  };

  const getProgressIcon = (tour: Tour) => {
    if (completedTours.includes(tour)) {
      return " ✅";
    } else if (startedTours.includes(tour)) {
      return " 🟠";
    }

    return "";
  };

  return (
    <Menu
      className="[&_>_ul_>_*]:gap-x-2"
      anchorEl={helpAnchorEl}
      isOpen={helpMenuOpen}
      closeMenu={() => setHelpAnchorEl(null)}
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
        </TabList>

        <TabPanel value="Builders" className="p-2">
          <TutorialMenuItem onClick={() => startTour("diagramBasics")}>
            1. Diagram basics{getProgressIcon("diagramBasics")}
          </TutorialMenuItem>
          <TutorialMenuItem onClick={() => startTour("breakdown")}>
            2. Breaking down a problem{getProgressIcon("breakdown")}
          </TutorialMenuItem>
          <TutorialMenuItem onClick={() => startTour("addingNuance")}>
            3. Adding nuance{getProgressIcon("addingNuance")}
          </TutorialMenuItem>
          <TutorialMenuItem onClick={() => startTour("evaluatingTradeoffs")}>
            4. Evaluating tradeoffs{getProgressIcon("evaluatingTradeoffs")}
          </TutorialMenuItem>
          <TutorialMenuItem onClick={() => startTour("buildingViews")}>
            5. Building views{getProgressIcon("buildingViews")}
          </TutorialMenuItem>
        </TabPanel>

        <TabPanel value="Viewers" className="p-2">
          <TutorialMenuItem disabled>1a. Reading a diagram (coming soon)</TutorialMenuItem>
          <TutorialMenuItem disabled>1b. Evaluating tradeoffs (coming soon)</TutorialMenuItem>
          <TutorialMenuItem disabled>2. Navigating a topic (coming soon)</TutorialMenuItem>
        </TabPanel>

        <TabPanel value="Experts" className="p-2">
          <TutorialMenuItem disabled>More actions (coming later)</TutorialMenuItem>
          <TutorialMenuItem disabled>Advanced filtering (coming later)</TutorialMenuItem>
        </TabPanel>
      </TabContext>
    </Menu>
  );
};
