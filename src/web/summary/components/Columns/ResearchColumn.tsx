import { School, Timeline } from "@mui/icons-material";
import { Divider } from "@mui/material";

import { researchDirectedSearchRelations } from "@/web/summary/aspectFilter";
import { IndirectHelpIcon } from "@/web/summary/components/IndirectHelpIcon";
import { Row } from "@/web/summary/components/Row";
import { AddNodeButtonGroup } from "@/web/topic/components/Node/AddNodeButtonGroup";
import { useResearch } from "@/web/topic/diagramStore/summary";
import { addableRelationsFrom, filterAddablesViaSearchRelations } from "@/web/topic/utils/edge";
import { Node } from "@/web/topic/utils/graph";

interface Props {
  summaryNode: Node;
}

export const ResearchColumn = ({ summaryNode }: Props) => {
  const { directNodes, indirectNodes } = useResearch(summaryNode);

  const defaultAddableRelations = addableRelationsFrom(
    summaryNode.type,
    undefined,
    false,
    "n/a",
    false,
  );

  const addableRelations = filterAddablesViaSearchRelations(
    defaultAddableRelations,
    researchDirectedSearchRelations,
  );

  const AddButtons = (
    <div className="pb-1.5">
      <AddNodeButtonGroup fromNodeId={summaryNode.id} addableRelations={addableRelations} />
    </div>
  );

  return (
    <div className="flex flex-col">
      <Row title="Research" Icon={School} addButtonsSlot={AddButtons} nodes={directNodes} />

      <Divider className="mx-2 my-1" />

      <Row
        title="Indirect"
        Icon={Timeline}
        endHeaderSlot={<IndirectHelpIcon />}
        nodes={indirectNodes}
      />
    </div>
  );
};
