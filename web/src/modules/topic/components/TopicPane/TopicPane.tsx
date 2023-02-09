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

import { setActiveDiagram } from "../../store/actions";
import {
  problemDiagramId,
  useActiveDiagramId,
  useClaimDiagramIdentifiers,
  useRootTitle,
} from "../../store/store";
import {
  NestedListItemButton,
  PositionedDiv,
  PositionedIconButton,
  StyledDrawer,
  StyledListItemButton,
} from "./TopicPane.styles";

export const TopicPane = () => {
  const [isTopicDrawerOpen, setIsTopicDrawerOpen] = useState(true);
  const [isClaimsListOpen, setIsClaimsListOpen] = useState(true);

  const activeDiagramId = useActiveDiagramId();

  const rootTitle = useRootTitle();
  const claimDiagramIdentifiers = useClaimDiagramIdentifiers();

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
        <PositionedIconButton onClick={handleDrawerToggle} color="primary">
          {isTopicDrawerOpen ? <ChevronLeft /> : <Menu />}
        </PositionedIconButton>
        {/* `permanent` because `persistent` adds transitions that conflict with our styles */}
        <StyledDrawer variant="permanent" open={isTopicDrawerOpen}>
          {/* Drawer's Paper height is full height of screen, so this toolbar exists to push the list below the two toolbars on the page */}
          <Toolbar variant="dense" />
          <Toolbar variant="dense" />
          <List>
            <ListItem key="1" disablePadding>
              <StyledListItemButton
                selected={activeDiagramId === problemDiagramId}
                onClick={() => setActiveDiagram(problemDiagramId)}
              >
                <ListItemIcon>
                  <AutoStories />
                </ListItemIcon>
                <ListItemText primary={rootTitle} />
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
                {claimDiagramIdentifiers.length === 0 && (
                  <ListItem key="1" disablePadding>
                    <NestedListItemButton disabled={true}>
                      <ListItemIcon>
                        <Article />
                      </ListItemIcon>
                      <ListItemText primary="No claims yet!" />
                    </NestedListItemButton>
                  </ListItem>
                )}
                {claimDiagramIdentifiers.map(([diagramId, diagramTitle]) => (
                  <ListItem key={diagramId} disablePadding>
                    <NestedListItemButton
                      selected={activeDiagramId === diagramId}
                      onClick={() => setActiveDiagram(diagramId)}
                    >
                      <ListItemIcon>
                        <Article />
                      </ListItemIcon>
                      <ListItemText primary={diagramTitle} />
                    </NestedListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </List>
        </StyledDrawer>
      </PositionedDiv>
    </>
  );
};
