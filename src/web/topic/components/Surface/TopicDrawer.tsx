import {
  Article,
  AutoStories,
  ChevronLeft,
  ExpandLess,
  ExpandMore,
  KeyboardArrowDown,
  LibraryBooks,
  TableChart,
  TableView,
} from "@mui/icons-material";
import {
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useState } from "react";

import { useNodes } from "../../store/nodeHooks";
import {
  useActiveClaimTreeId,
  useActiveTableProblemId,
  useClaimTreesWithExplicitClaims,
} from "../../store/store";
import { viewClaimTree, viewCriteriaTable, viewTopicDiagram } from "../../store/viewActions";
import { topicDiagramId } from "../../utils/diagram";
import {
  NestedListItemButton,
  PositionedDiv,
  StyledDrawer,
  ToggleDrawerButton,
} from "./TopicDrawer.styles";

interface Props {
  isLandscape: boolean;
}

export const TopicDrawer = ({ isLandscape }: Props) => {
  const [isTopicDrawerOpen, setIsTopicDrawerOpen] = useState(true);
  const [isClaimsListOpen, setIsClaimsListOpen] = useState(true);
  const [isProblemsListOpen, setIsProblemsListOpen] = useState(true);

  const activeTableProblemId = useActiveTableProblemId();
  const activeClaimTreeId = useActiveClaimTreeId();

  const claimTreeIdentifiers = useClaimTreesWithExplicitClaims();
  const problems = useNodes(topicDiagramId, (node) => node.type === "problem");

  const handleDrawerToggle = () => {
    if (isTopicDrawerOpen) {
      setIsTopicDrawerOpen(false);
    } else {
      setIsTopicDrawerOpen(true);
    }
  };

  const ToggleIcon = isTopicDrawerOpen
    ? isLandscape
      ? ChevronLeft
      : KeyboardArrowDown
    : AutoStories;

  return (
    <>
      {/* div to enable menu button to be positioned to the right of the drawer */}
      <PositionedDiv>
        <ToggleDrawerButton onClick={handleDrawerToggle} color="primary" isLandscape={isLandscape}>
          <ToggleIcon />
        </ToggleDrawerButton>
        {/* `permanent` because `persistent` adds transitions that conflict with our styles */}
        <StyledDrawer
          variant="permanent"
          open={isTopicDrawerOpen}
          anchor={isLandscape ? "left" : "bottom"}
          isLandscape={isLandscape}
        >
          <List>
            <ListItem key="1">
              <ListItemButton
                selected={!activeTableProblemId && !activeClaimTreeId}
                onClick={() => viewTopicDiagram()}
              >
                <ListItemIcon>
                  <AutoStories />
                </ListItemIcon>
                <ListItemText primary="Topic Diagram" />
              </ListItemButton>
            </ListItem>
            <ListItem key="2">
              <ListItemButton onClick={() => setIsProblemsListOpen(!isProblemsListOpen)}>
                <ListItemIcon>
                  <TableView />
                </ListItemIcon>
                <ListItemText primary="Criteria Tables" />
                {isProblemsListOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={isProblemsListOpen} timeout="auto" unmountOnExit>
              <List disablePadding>
                {problems.length === 0 && (
                  <ListItem key="1">
                    <NestedListItemButton disabled={true}>
                      <ListItemIcon>
                        <TableChart />
                      </ListItemIcon>
                      <ListItemText primary="No criteria yet!" />
                    </NestedListItemButton>
                  </ListItem>
                )}
                {problems.map(({ id: nodeId, data }) => (
                  <ListItem key={nodeId}>
                    <NestedListItemButton
                      selected={!activeClaimTreeId && activeTableProblemId === nodeId}
                      onClick={() => viewCriteriaTable(nodeId)}
                    >
                      <ListItemIcon>
                        <TableChart />
                      </ListItemIcon>
                      <ListItemText primary={data.label} />
                    </NestedListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
            <ListItem key="3">
              <ListItemButton onClick={() => setIsClaimsListOpen(!isClaimsListOpen)}>
                <ListItemIcon>
                  <LibraryBooks />
                </ListItemIcon>
                <ListItemText primary="Claim Trees" />
                {isClaimsListOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={isClaimsListOpen} timeout="auto" unmountOnExit>
              <List disablePadding>
                {claimTreeIdentifiers.length === 0 && (
                  <ListItem key="1">
                    <NestedListItemButton disabled={true}>
                      <ListItemIcon>
                        <Article />
                      </ListItemIcon>
                      <ListItemText primary="No claims yet!" />
                    </NestedListItemButton>
                  </ListItem>
                )}
                {claimTreeIdentifiers.map(([diagramId, diagramTitle]) => (
                  <ListItem key={diagramId}>
                    <NestedListItemButton
                      selected={activeClaimTreeId === diagramId}
                      onClick={() => viewClaimTree(diagramId)}
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
