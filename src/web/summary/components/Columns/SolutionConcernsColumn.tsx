import { Timeline } from "@mui/icons-material";
import { Divider } from "@mui/material";

import { IndirectHelpIcon } from "@/web/summary/components/IndirectHelpIcon";
import { Row } from "@/web/summary/components/Row";
import { AddNodeButtonGroup } from "@/web/topic/components/Node/AddNodeButtonGroup";
import { useDetriments, useObstacles } from "@/web/topic/diagramStore/summary";
import { Node } from "@/web/topic/utils/graph";
import { nodeDecorations } from "@/web/topic/utils/node";

interface Props {
  summaryNode: Node;
}

export const SolutionConcernsColumn = ({ summaryNode }: Props) => {
  const { directNodes: directDetriments, indirectNodes: indirectDetriments } =
    useDetriments(summaryNode);
  const { directNodes: directObstacles, indirectNodes: indirectObstacles } =
    useObstacles(summaryNode);

  const AddButtons = (
    <div className="pb-1.5">
      <AddNodeButtonGroup
        fromNodeId={summaryNode.id}
        addableRelations={[
          { child: summaryNode.type, name: "creates", parent: "detriment", as: "parent" },
          { child: "obstacle", name: "obstacleOf", parent: summaryNode.type, as: "child" },
        ]}
      />
    </div>
  );

  return (
    <div className="flex flex-col">
      <Row
        title="Concerns"
        Icon={nodeDecorations.detriment.NodeIcon}
        addButtonsSlot={AddButtons}
        nodes={[...directDetriments, ...directObstacles]}
      />

      <Divider className="mx-2 my-1" />

      <Row
        title="Indirect"
        Icon={Timeline}
        endHeaderSlot={<IndirectHelpIcon />}
        nodes={[...indirectDetriments, ...indirectObstacles]}
      />
    </div>
  );
};
