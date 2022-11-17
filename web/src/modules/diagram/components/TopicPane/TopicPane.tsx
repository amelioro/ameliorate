import {
  Article,
  AutoStories,
  ChevronLeft,
  ExpandLess,
  ExpandMore,
  LibraryBooks,
  Menu,
} from "@mui/icons-material";
import { Collapse, List, ListItem, ListItemIcon, ListItemText, Toolbar } from "@mui/material";
import { useState } from "react";

import {
  NestedListItemButton,
  PositionedDiv,
  PositionedIconButton,
  StyledDrawer,
  StyledListItemButton,
} from "../TopicPane/TopicPane.styles";

export const TopicPane = () => {
  const [isTopicDrawerOpen, setIsTopicDrawerOpen] = useState(true);
  const [isClaimsListOpen, setIsClaimsListOpen] = useState(true);

  const handleDrawerToggle = () => {
    if (isTopicDrawerOpen) {
      setIsTopicDrawerOpen(false);
    } else {
      setIsTopicDrawerOpen(true);
    }
  };

  return (
    <>
      {/* div to enable menu button to be positioned to the right of the drawer */}
      <PositionedDiv>
        <PositionedIconButton onClick={handleDrawerToggle}>
          {isTopicDrawerOpen ? <ChevronLeft /> : <Menu />}
        </PositionedIconButton>
        {/* `permanent` because `persistent` adds transitions that conflict with our styles */}
        <StyledDrawer variant="permanent" open={isTopicDrawerOpen}>
          {/* Drawer's Paper height is full height of screen, so this toolbar exists to push the list below the layout's toolbar */}
          <Toolbar variant="dense" />
          <List>
            <ListItem key="1" disablePadding>
              <StyledListItemButton>
                <ListItemIcon>
                  <AutoStories />
                </ListItemIcon>
                <ListItemText primary="Root view does this expand?" />
              </StyledListItemButton>
            </ListItem>
            <ListItem key="2" disablePadding>
              <StyledListItemButton onClick={() => setIsClaimsListOpen(!isClaimsListOpen)}>
                <ListItemIcon>
                  <LibraryBooks />
                </ListItemIcon>
                <ListItemText primary="Claims" />
                {isClaimsListOpen ? <ExpandLess /> : <ExpandMore />}
              </StyledListItemButton>
            </ListItem>
            <Collapse in={isClaimsListOpen} timeout="auto" unmountOnExit>
              <List disablePadding>
                <ListItem key="1" disablePadding>
                  <NestedListItemButton>
                    <ListItemIcon>
                      <Article />
                    </ListItemIcon>
                    <ListItemText primary="Claim 1" />
                  </NestedListItemButton>
                </ListItem>
              </List>
            </Collapse>
          </List>
        </StyledDrawer>
      </PositionedDiv>
    </>
  );
};
