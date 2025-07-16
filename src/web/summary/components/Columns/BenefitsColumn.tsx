import { Timeline } from "@mui/icons-material";
import { Divider } from "@mui/material";

import { IndirectHelpIcon } from "@/web/summary/components/IndirectHelpIcon";
import { Row } from "@/web/summary/components/Row";
import { AddNodeButton } from "@/web/topic/components/Node/AddNodeButton";
import { useBenefits } from "@/web/topic/diagramStore/summary";
import { Node } from "@/web/topic/utils/graph";
import { nodeDecorations } from "@/web/topic/utils/node";

interface Props {
  summaryNode: Node;
}

export const BenefitsColumn = ({ summaryNode }: Props) => {
  const { directNodes, indirectNodes } = useBenefits(summaryNode);

  const AddButtons = (
    <div className="pb-1.5">
      <AddNodeButton
        fromPartId={summaryNode.id}
        toNodeType="benefit"
        as="parent"
        relation={{ child: summaryNode.type, name: "creates", parent: "benefit" }}
      />
    </div>
  );

  return (
    <div className="flex flex-col">
      <Row
        title="Benefits"
        Icon={nodeDecorations.benefit.NodeIcon}
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
