import { Timeline } from "@mui/icons-material";
import { Divider } from "@mui/material";

import { IndirectHelpIcon } from "@/web/summary/components/IndirectHelpIcon";
import { Row } from "@/web/summary/components/Row";
import { AddNodeButton } from "@/web/topic/components/Node/AddNodeButton";
import { useCauses } from "@/web/topic/diagramStore/summary";
import { Node } from "@/web/topic/utils/graph";
import { nodeDecorations } from "@/web/topic/utils/node";

interface Props {
  summaryNode: Node;
}

export const CausesColumn = ({ summaryNode }: Props) => {
  const { directNodes, indirectNodes } = useCauses(summaryNode);

  // TODO: implement this based on where we're a problem-like node or a solution-like node
  const AddButtons = (
    <div className="pb-1.5">
      <AddNodeButton
        fromPartId={summaryNode.id}
        toNodeType="cause"
        as="child"
        relation={{ child: "cause", name: "causes", parent: summaryNode.type }}
      />
    </div>
  );

  return (
    <div className="flex flex-col">
      <Row
        title="Causes"
        Icon={nodeDecorations.cause.NodeIcon}
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
