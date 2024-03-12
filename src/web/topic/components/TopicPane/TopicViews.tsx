import {
  AccountTree,
  AutoStories,
  ExpandLess,
  ExpandMore,
  FilterAlt,
  School,
  TableChart,
  TableView,
} from "@mui/icons-material";
import {
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useState } from "react";

import { FilterOptions } from "../../../view/components/FilterOptions/FilterOptions";
import {
  useActiveArguedDiagramPart,
  useActiveTableProblemNode,
  useActiveView,
  viewClaimTree,
  viewCriteriaTable,
  viewResearchDiagram,
  viewTopicDiagram,
} from "../../../view/navigateStore";
import { useCriteriaTableProblemNodes } from "../../store/nodeHooks";
import { useClaimTreesWithExplicitClaims } from "../../store/store";
import { NestedListItemButton } from "./TopicViews.styles";

export const TopicViews = () => {
  const [isClaimsListOpen, setIsClaimsListOpen] = useState(true);
  const [isProblemsListOpen, setIsProblemsListOpen] = useState(true);
  const [isFilterOptionsOpen, setIsFilterOptionsOpen] = useState(true);

  const activeView = useActiveView();
  const activeDiagram = activeView === "criteriaTable" ? "topicDiagram" : activeView;
  const activeTableProblemNode = useActiveTableProblemNode();
  const activeArguedDiagramPart = useActiveArguedDiagramPart();

  const claimTreeIdentifiers = useClaimTreesWithExplicitClaims();
  const problems = useCriteriaTableProblemNodes();

  return (
    <List>
      <ListItem key="1">
        <ListItemButton selected={activeView === "topicDiagram"} onClick={() => viewTopicDiagram()}>
          <ListItemIcon>
            <AutoStories />
          </ListItemIcon>
          <ListItemText primary="Topic Diagram" />
        </ListItemButton>
      </ListItem>
      <ListItem key="2">
        <ListItemButton
          selected={activeView === "researchDiagram"}
          onClick={() => viewResearchDiagram()}
        >
          <ListItemIcon>
            <School />
          </ListItemIcon>
          <ListItemText primary="Research Diagram" />
        </ListItemButton>
      </ListItem>
      <ListItem key="3">
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
                <ListItemText primary="No criteria tables yet!" />
              </NestedListItemButton>
            </ListItem>
          )}
          {problems.map(({ id: nodeId, data }) => (
            <ListItem key={nodeId}>
              <NestedListItemButton
                selected={activeView === "criteriaTable" && activeTableProblemNode?.id === nodeId}
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
      <ListItem key="4">
        <ListItemButton onClick={() => setIsClaimsListOpen(!isClaimsListOpen)}>
          <ListItemIcon>
            <AccountTree />
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
                  <AccountTree />
                </ListItemIcon>
                <ListItemText primary="No claims yet!" />
              </NestedListItemButton>
            </ListItem>
          )}
          {claimTreeIdentifiers.map(([arguedDiagramPartId, diagramTitle]) => (
            <ListItem key={arguedDiagramPartId}>
              <NestedListItemButton
                selected={
                  activeView === "claimTree" && activeArguedDiagramPart?.id === arguedDiagramPartId
                }
                onClick={() => viewClaimTree(arguedDiagramPartId)}
              >
                <ListItemIcon>
                  <AccountTree />
                </ListItemIcon>
                <ListItemText primary={diagramTitle} />
              </NestedListItemButton>
            </ListItem>
          ))}
        </List>
      </Collapse>
      {(activeDiagram === "topicDiagram" || activeDiagram === "researchDiagram") && (
        <>
          <Divider sx={{ marginY: 1 }} />

          <ListItem key="5">
            <ListItemButton onClick={() => setIsFilterOptionsOpen(!isFilterOptionsOpen)}>
              <ListItemIcon>
                <FilterAlt />
              </ListItemIcon>
              <ListItemText primary="Filter Options" />
              {isFilterOptionsOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={isFilterOptionsOpen} timeout="auto" unmountOnExit>
            <FilterOptions key={activeDiagram} activeDiagram={activeDiagram} />
          </Collapse>
        </>
      )}
    </List>
  );
};
