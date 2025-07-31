import { Timeline } from "@mui/icons-material";
import { Divider } from "@mui/material";

import { IndirectHelpIcon } from "@/web/summary/components/IndirectHelpIcon";
import { Row } from "@/web/summary/components/Row";
import { AddNodeButtonGroup } from "@/web/topic/components/Node/AddNodeButtonGroup";
import { useObstacles } from "@/web/topic/diagramStore/summary";
import { Node } from "@/web/topic/utils/graph";
import { nodeDecorations } from "@/web/topic/utils/node";

interface Props {
  summaryNode: Node;
}

export const ObstaclesColumn = ({ summaryNode }: Props) => {
  const { directNodes, indirectNodes } = useObstacles(summaryNode);

  const AddButtons = (
    <div className="pb-1.5">
      <AddNodeButtonGroup
        fromNodeId={summaryNode.id}
        addableRelations={[
          { child: "obstacle", name: "obstacleOf", parent: summaryNode.type, as: "child" },
        ]}
      />
    </div>
  );

  return (
    <div className="flex flex-col">
      <Row
        title="Obstacles"
        Icon={nodeDecorations.obstacle.NodeIcon}
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
