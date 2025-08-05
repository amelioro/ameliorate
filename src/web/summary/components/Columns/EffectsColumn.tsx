import { Timeline } from "@mui/icons-material";
import { Divider } from "@mui/material";

import { IndirectHelpIcon } from "@/web/summary/components/IndirectHelpIcon";
import { Row } from "@/web/summary/components/Row";
import { AddNodeButtonGroup } from "@/web/topic/components/Node/AddNodeButtonGroup";
import { useEffects } from "@/web/topic/diagramStore/summary";
import { Node } from "@/web/topic/utils/graph";
import { nodeDecorations } from "@/web/topic/utils/node";

interface Props {
  summaryNode: Node;
}

export const EffectsColumn = ({ summaryNode }: Props) => {
  const { directNodes, indirectNodes } = useEffects(summaryNode);

  // TODO: implement this based on where we're a problem-like node or a solution-like node
  // TODO: should also be able to add plain effect nodes
  const AddButtons = (
    <div className="pb-1.5">
      <AddNodeButtonGroup
        fromNodeId={summaryNode.id}
        addableRelations={[
          { child: summaryNode.type, name: "creates", parent: "benefit", as: "parent" },
          { child: summaryNode.type, name: "creates", parent: "detriment", as: "parent" },
        ]}
      />
    </div>
  );

  return (
    <div className="flex flex-col">
      <Row
        title="Effects"
        Icon={nodeDecorations.effect.NodeIcon}
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
