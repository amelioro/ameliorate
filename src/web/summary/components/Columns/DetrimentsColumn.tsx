import { Timeline } from "@mui/icons-material";
import { Divider } from "@mui/material";

import { IndirectHelpIcon } from "@/web/summary/components/IndirectHelpIcon";
import { Row } from "@/web/summary/components/Row";
import { AddNodeButton } from "@/web/topic/components/Node/AddNodeButton";
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
        <AddNodeButton
          fromPartId={summaryNode.id}
          toNodeType="detriment"
          as="child"
          relation={{ child: "detriment", name: "createdBy", parent: summaryNode.type }}
        />
      ) : (
        <AddNodeButton
          fromPartId={summaryNode.id}
          toNodeType="detriment"
          as="parent"
          relation={{ child: summaryNode.type, name: "creates", parent: "detriment" }}
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
