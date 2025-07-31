import { Timeline } from "@mui/icons-material";
import { Divider } from "@mui/material";

import { IndirectHelpIcon } from "@/web/summary/components/IndirectHelpIcon";
import { Row } from "@/web/summary/components/Row";
import { AddNodeButtonGroup } from "@/web/topic/components/Node/AddNodeButtonGroup";
import { useDetriments } from "@/web/topic/diagramStore/summary";
import { Node } from "@/web/topic/utils/graph";
import { nodeDecorations } from "@/web/topic/utils/node";

interface Props {
  summaryNode: Node;
}

export const DetrimentsColumn = ({ summaryNode }: Props) => {
  const { directNodes, indirectNodes } = useDetriments(summaryNode);

  const AddButtons = (
    <div className="pb-1.5">
      {/* TODO: this path should run if it's any problem-like node, including problem effects */}
      {summaryNode.type === "problem" ? (
        <AddNodeButtonGroup
          fromNodeId={summaryNode.id}
          addableRelations={[
            { child: "detriment", name: "createdBy", parent: summaryNode.type, as: "child" },
          ]}
        />
      ) : (
        <AddNodeButtonGroup
          fromNodeId={summaryNode.id}
          addableRelations={[
            { child: summaryNode.type, name: "creates", parent: "detriment", as: "parent" },
          ]}
        />
      )}
    </div>
  );

  return (
    <div className="flex flex-col">
      <Row
        title="Detriments"
        Icon={nodeDecorations.detriment.NodeIcon}
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
