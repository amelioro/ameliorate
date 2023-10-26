import {
  Article,
  AutoStories,
  ExpandLess,
  ExpandMore,
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
  useActiveArguedDiagramPart,
  useActiveTableProblemNode,
  useClaimTreesWithExplicitClaims,
} from "../../store/store";
import { viewClaimTree, viewCriteriaTable, viewTopicDiagram } from "../../store/viewActions";
import { topicDiagramId } from "../../utils/diagram";
import { NestedListItemButton } from "./TopicViews.styles";

export const TopicViews = () => {
  const [isClaimsListOpen, setIsClaimsListOpen] = useState(true);
  const [isProblemsListOpen, setIsProblemsListOpen] = useState(true);

  const activeTableProblemNode = useActiveTableProblemNode();
  const activeArguedDiagramPart = useActiveArguedDiagramPart();

  const claimTreeIdentifiers = useClaimTreesWithExplicitClaims();
  const problems = useNodes(topicDiagramId, (node) => node.type === "problem");

  return (
    <List>
      <ListItem key="1">
        <ListItemButton
          selected={!activeTableProblemNode && !activeArguedDiagramPart}
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
                selected={!activeArguedDiagramPart && activeTableProblemNode?.id === nodeId}
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
                selected={activeArguedDiagramPart?.id === diagramId}
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
  );
};
