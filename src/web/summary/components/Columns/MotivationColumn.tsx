import { Timeline } from "@mui/icons-material";
import { Divider } from "@mui/material";

import { IndirectHelpIcon } from "@/web/summary/components/IndirectHelpIcon";
import { Row } from "@/web/summary/components/Row";
import { AddNodeButtonGroup } from "@/web/topic/components/Node/AddNodeButtonGroup";
import { useAddressed, useBenefits } from "@/web/topic/diagramStore/summary";
import { Node } from "@/web/topic/utils/graph";
import { nodeDecorations } from "@/web/topic/utils/node";

interface Props {
  summaryNode: Node;
}

export const MotivationColumn = ({ summaryNode }: Props) => {
  const { directNodes: directBenefits, indirectNodes: indirectBenefits } = useBenefits(summaryNode);
  const { directNodes: directAddressed, indirectNodes: indirectAddressed } =
    useAddressed(summaryNode);

  const AddButtons = (
    <div className="pb-1.5">
      <AddNodeButtonGroup
        fromNodeId={summaryNode.id}
        addableRelations={[
          { child: summaryNode.type, name: "creates", parent: "benefit", as: "parent" },
          { child: summaryNode.type, name: "addresses", parent: "problem", as: "parent" },
        ]}
      />
    </div>
  );

  return (
    <div className="flex flex-col">
      <Row
        title="Motivation"
        Icon={nodeDecorations.benefit.NodeIcon}
        addButtonsSlot={AddButtons}
        nodes={[...directBenefits, ...directAddressed]}
      />

      <Divider className="mx-2 my-1" />

      <Row
        title="Indirect"
        Icon={Timeline}
        endHeaderSlot={<IndirectHelpIcon />}
        nodes={[...indirectBenefits, ...indirectAddressed]}
      />
    </div>
  );
};
