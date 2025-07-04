import { Home } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { IconButton, Tab, Typography, styled } from "@mui/material";
import { startCase } from "es-toolkit";
// import { ComponentType } from "react";

// import { Node } from "@/common/node";
import { CoreNodesColumn } from "@/web/summary/components/CoreNodesColumn";
import {
  Category,
  // NodeAspect,
  Summary as SummaryType,
  // TopicAspect,
  categoriesBySummary,
} from "@/web/summary/summary";
import { maxNodeHeightRem } from "@/web/topic/components/Node/EditableNode.styles";
import {
  setSelectedSummaryTab,
  setSummaryNodeId,
  useSelectedSummaryTab,
  useSummaryNode,
} from "@/web/view/currentViewStore/summary";

// interface NodeColumnProps {
//   summaryNode: Node;
// }
// const columnComponentsByNodeAspect: Record<NodeAspect, ComponentType<NodeColumnProps>> = {
// };

export const Summary = () => {
  const summaryNode = useSummaryNode();
  const selectedTab = useSelectedSummaryTab();

  const summary: SummaryType = summaryNode ? summaryNode.type : "topic";
  const summaryCategories = categoriesBySummary[summary] ?? [];

  return (
    <div
      // Max-w because the left/right-corner things (i.e. row header, row action, home button) become pretty far away on big screens otherwise.
      // Ideally we would probably position on big screens differently? not sure.
      className="flex min-h-0 w-full max-w-2xl grow flex-col self-center"
    >
      <NavDiv>
        <IconButton
          title="Summary Home"
          aria-label="Summary Home"
          size="small"
          onClick={() => setSummaryNodeId(null)}
        >
          <Home fontSize="inherit" />
        </IconButton>
      </NavDiv>

      <HeaderDiv
        className="flex items-center justify-center border-y p-2"
        sx={{ height: `${maxNodeHeightRem}rem` }}
      >
        <Typography variant="body1">Click on a core node to see its summary</Typography>
      </HeaderDiv>

      <TabContext value={selectedTab}>
        <TabList
          onChange={(_, value: Category) => setSelectedSummaryTab(value)}
          aria-label="Summary Tabs"
          className="border-b"
          centered
        >
          {summaryCategories.map((category) => (
            <Tab key={category} value={category} label={startCase(category)} />
          ))}
        </TabList>

        {summaryCategories.map((category) => (
          <TabPanel key={category} value={category} className="grow overflow-y-auto p-1">
            {
              // category === "coreNodes" ? (<CoreNodesColumn />) : (<></>)
              <CoreNodesColumn />
            }
          </TabPanel>
        ))}
      </TabContext>
    </div>
  );
};

const NavDiv = styled("div")``;
const HeaderDiv = styled("div")``;
