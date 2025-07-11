import { Home } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { IconButton, Tab, Typography, styled } from "@mui/material";
import { startCase } from "es-toolkit";
import { ComponentType } from "react";

import { AddressedColumn } from "@/web/summary/components/AddressedColumn";
import { AllColumn } from "@/web/summary/components/AllColumn";
import { BenefitsColumn } from "@/web/summary/components/BenefitsColumn";
import { ComponentsColumn } from "@/web/summary/components/ComponentsColumn";
import { CoreNodesColumn } from "@/web/summary/components/CoreNodesColumn";
import { DetrimentsColumn } from "@/web/summary/components/DetrimentsColumn";
import { ObstaclesColumn } from "@/web/summary/components/ObstaclesColumn";
import {
  Category,
  NodeAspect,
  Summary as SummaryType,
  aspectsByCategory,
  categoriesBySummary,
} from "@/web/summary/summary";
import { EditableNode } from "@/web/topic/components/Node/EditableNode";
import { maxNodeHeightRem } from "@/web/topic/components/Node/EditableNode.styles";
import { Node } from "@/web/topic/utils/graph";
import {
  setSelectedSummaryTab,
  setSummaryNodeId,
  useSelectedSummaryTab,
  useSummaryNode,
} from "@/web/view/currentViewStore/summary";
import { setSelected } from "@/web/view/selectedPartStore";

interface NodeColumnProps {
  summaryNode: Node;
}
const columnComponentsByAspect: Record<NodeAspect, ComponentType<NodeColumnProps>> = {
  components: ComponentsColumn,
  benefits: BenefitsColumn,
  addressed: AddressedColumn,
  detriments: DetrimentsColumn,
  obstacles: ObstaclesColumn,
  all: AllColumn,
};

export const Summary = () => {
  const summaryNode = useSummaryNode();
  const selectedTab = useSelectedSummaryTab();

  const summary: SummaryType = summaryNode ? summaryNode.type : "topic";
  const summaryCategories = categoriesBySummary[summary];

  /**
   * fallback if we change summary node and the selected tab is no longer valid
   */
  const selectedTabOrFallback = summaryCategories.includes(selectedTab)
    ? selectedTab
    : summaryCategories[0];

  return (
    <div
      // max-w because the left/right-corner things (i.e. row header, row action, home button) become pretty far away on big screens otherwise.
      // Ideally we would probably position on big screens differently? not sure.
      className="flex min-h-0 w-full max-w-2xl grow flex-col self-center"
    >
      <NavDiv>
        <IconButton
          title="Summary Home"
          aria-label="Summary Home"
          size="small"
          onClick={() => {
            setSelected(null);
            setSummaryNodeId(null);
          }}
        >
          <Home fontSize="inherit" />
        </IconButton>
      </NavDiv>

      <HeaderDiv className="flex items-center justify-center border-y py-2">
        {/* separate div so that height can be set and consistent separately from the padding of the parent */}
        <div className="flex items-center" style={{ height: `${maxNodeHeightRem}rem` }}>
          {summaryNode === null ? (
            <Typography variant="body1">Click on a core node to see its summary</Typography>
          ) : (
            <EditableNode node={summaryNode} />
          )}
        </div>
      </HeaderDiv>

      <TabContext value={selectedTabOrFallback}>
        <TabList
          onChange={(_, value: Category) => setSelectedSummaryTab(value)}
          aria-label="Summary Tabs"
          className="[&_.MuiTab-root]:min-w-[auto] [&_.MuiTab-root]:px-2 [&_.MuiTabScrollButton-root]:w-6"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          {summaryCategories.map((category) => (
            <Tab key={category} value={category} label={startCase(category)} />
          ))}
        </TabList>

        {summaryCategories.map((category) => {
          const aspects = aspectsByCategory[category];

          const columns =
            summaryNode === null
              ? [<CoreNodesColumn key="coreNodes" />]
              : (aspects as NodeAspect[]).map((aspect) => {
                  const ColumnComponent = columnComponentsByAspect[aspect];
                  return <ColumnComponent key={aspect} summaryNode={summaryNode} />;
                });

          return (
            <TabPanel
              key={category}
              value={category}
              className={
                "grow *:grow *:basis-0 divide-x overflow-y-auto p-0" +
                " [&>div>div]:p-1" +
                // need to use border-t here because for some reason the TabList itself has issues with border-b, where when TabPanel has a vertical scrollbar, the tab arrows will _always_ show, rather than conditionally based on horizontal scroll position
                " border-t" +
                (selectedTabOrFallback === category ? " flex" : " hidden")
              }
            >
              {columns}
            </TabPanel>
          );
        })}
      </TabContext>
    </div>
  );
};

const NavDiv = styled("div")``;
const HeaderDiv = styled("div")``;
