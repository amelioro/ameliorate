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

type TutorialTab = "Builders" | "Viewers" | "Experts";

interface Props {
  helpAnchorEl: HTMLElement | null;
  setHelpAnchorEl: Dispatch<SetStateAction<HTMLElement | null>>;
}

export const HelpMenu = ({ helpAnchorEl, setHelpAnchorEl }: Props) => {
  const [selectedTab, setSelectedTab] = useState<TutorialTab>("Builders");

  const helpMenuOpen = Boolean(helpAnchorEl);

  const TutorialMenuItem = (props: MenuItemProps) => {
    return <CloseOnClickMenuItem {...props} closeMenu={() => setHelpAnchorEl(null)} />;
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
            1. Diagram basics
          </TutorialMenuItem>
          <TutorialMenuItem disabled>2. Breaking down a problem (coming soon)</TutorialMenuItem>
          <TutorialMenuItem disabled>3. Adding nuance (coming soon)</TutorialMenuItem>
          <TutorialMenuItem disabled>4. Navigating a topic (coming soon)</TutorialMenuItem>
        </TabPanel>

        <TabPanel value="Viewers" className="p-2">
          <TutorialMenuItem disabled>1. Reading a diagram (coming soon)</TutorialMenuItem>
          <TutorialMenuItem disabled>2. Navigating a topic (coming soon)</TutorialMenuItem>
        </TabPanel>

        <TabPanel value="Experts" className="p-2">
          <TutorialMenuItem disabled>More actions (coming soon)</TutorialMenuItem>
          <TutorialMenuItem disabled>Building views (coming soon)</TutorialMenuItem>
        </TabPanel>
      </TabContext>
    </Menu>
  );
};
