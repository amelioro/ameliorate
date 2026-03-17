import { styled } from "@mui/material";

import { type CalculatedEdge } from "@/common/edge";
import { StandaloneEdge } from "@/web/topic/components/Edge/StandaloneEdge";
import { EditableNode } from "@/web/topic/components/Node/EditableNode";
import { CalculatedEdgeDetails } from "@/web/topic/components/TopicPane/CalculatedEdgeDetails";
import { DetailsTab, GraphPartDetails } from "@/web/topic/components/TopicPane/GraphPartDetails";
import { type GraphPart, isNode } from "@/web/topic/utils/graph";
import { isIndirectEdge } from "@/web/topic/utils/indirectEdges";

interface Props {
  selectedPart: GraphPart | CalculatedEdge;
  /**
   * This is hoisted to parent so that it's preserved when a part becomes deselected & reselected.
   *
   * - Alternative 1: keep `SelectedPartDetails` always rendered; but performance, and `viewTab` event
   * handling would need to move around.
   * - Alternative 2: use a store for this state; but seems like overkill?
   */
  selectedTab: DetailsTab;
  setSelectedTab: (tab: DetailsTab) => void;
}

export const SelectedPartDetails = ({ selectedPart, selectedTab, setSelectedTab }: Props) => {
  return (
    // min-h-0 to ensure content can shrink within parent flex container, allowing inner containers to control scrolling https://stackoverflow.com/a/66689926/8409296
    // grow so that it can take up the full pane's space and not overflow if a node is at the bottom and has an indicator overhanging
    <div className="flex min-h-0 grow flex-col py-0">
      {/* hardcode shadow to be 1px lower than default tailwind shadow so that no shadow appears above the container */}
      <GraphPartHeaderDiv className="flex flex-col items-center border-b pb-2 shadow-[0_2px_3px_0_rgba(0,0,0,0.1)]">
        {isNode(selectedPart) ? (
          // z-index to ensure hanging node indicators don't fall behind the next section's empty background
          <EditableNode node={selectedPart} className="z-10" />
        ) : (
          <StandaloneEdge edge={selectedPart} />
        )}
      </GraphPartHeaderDiv>

      <ContentDiv className="grow overflow-auto">
        {isIndirectEdge(selectedPart) ? (
          <CalculatedEdgeDetails indirectEdge={selectedPart} />
        ) : (
          <GraphPartDetails
            graphPart={selectedPart}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
          />
        )}
      </ContentDiv>
    </div>
  );
};

const GraphPartHeaderDiv = styled("div")``;
const ContentDiv = styled("div")``;
