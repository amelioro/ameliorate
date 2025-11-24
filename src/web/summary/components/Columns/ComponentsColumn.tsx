import { Timeline } from "@mui/icons-material";
import { Divider } from "@mui/material";

import { componentsDirectedSearchRelations } from "@/web/summary/aspectFilter";
import { IndirectHelpIcon } from "@/web/summary/components/IndirectHelpIcon";
import { Row } from "@/web/summary/components/Row";
import { AddNodeButtonGroup } from "@/web/topic/components/Node/AddNodeButtonGroup";
import { useComponents } from "@/web/topic/diagramStore/summary";
import { addableRelationsFrom, filterAddablesViaSearchRelations } from "@/web/topic/utils/edge";
import { Node } from "@/web/topic/utils/graph";
import { nodeDecorations } from "@/web/topic/utils/nodeDecoration";

interface Props {
  summaryNode: Node;
}

export const ComponentsColumn = ({ summaryNode }: Props) => {
  const { directNodes, indirectNodes } = useComponents(summaryNode);

  const defaultAddableRelations = addableRelationsFrom(summaryNode.type, undefined, false, "n/a");

  const addableRelations = filterAddablesViaSearchRelations(
    defaultAddableRelations,
    componentsDirectedSearchRelations,
  );

  const AddButtons = (
    <div className="pb-1.5">
      <AddNodeButtonGroup fromNodeId={summaryNode.id} addableRelations={addableRelations} />
    </div>
  );

  return (
    <div className="flex flex-col">
      <Row
        title="Components"
        Icon={nodeDecorations.solutionComponent.NodeIcon}
        addButtonsSlot={AddButtons}
        nodes={directNodes}
      />

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
