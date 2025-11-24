import { Timeline } from "@mui/icons-material";
import { Divider } from "@mui/material";

import {
  detrimentsDirectedSearchRelations,
  obstaclesDirectedSearchRelations,
} from "@/web/summary/aspectFilter";
import { IndirectHelpIcon } from "@/web/summary/components/IndirectHelpIcon";
import { Row } from "@/web/summary/components/Row";
import { AddNodeButtonGroup } from "@/web/topic/components/Node/AddNodeButtonGroup";
import { useDetriments, useObstacles } from "@/web/topic/diagramStore/summary";
import { addableRelationsFrom, filterAddablesViaSearchRelations } from "@/web/topic/utils/edge";
import { Node } from "@/web/topic/utils/graph";
import { nodeDecorations } from "@/web/topic/utils/nodeDecoration";

interface Props {
  summaryNode: Node;
}

export const SolutionConcernsColumn = ({ summaryNode }: Props) => {
  const { directNodes: directDetriments, indirectNodes: indirectDetriments } =
    useDetriments(summaryNode);
  const { directNodes: directObstacles, indirectNodes: indirectObstacles } =
    useObstacles(summaryNode);

  const defaultAddableRelations = addableRelationsFrom(summaryNode.type, undefined, false, "n/a");

  const addableRelations = filterAddablesViaSearchRelations(
    defaultAddableRelations,
    detrimentsDirectedSearchRelations.concat(obstaclesDirectedSearchRelations),
  );

  const AddButtons = (
    <div className="pb-1.5">
      <AddNodeButtonGroup fromNodeId={summaryNode.id} addableRelations={addableRelations} />
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
