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
import { nodeDecorations } from "@/web/topic/utils/node";

interface Props {
  summaryNode: Node;
}

export const SolutionConcernsColumn = ({ summaryNode }: Props) => {
  const { directNodes: directDetriments, indirectNodes: indirectDetriments } =
    useDetriments(summaryNode);
  const { directNodes: directObstacles, indirectNodes: indirectObstacles } =
    useObstacles(summaryNode);

  // need to grab both parent and child relations because detriments generally go up from solutions
  // and obstacles go down from solutions
  const defaultParentAddableRelations = addableRelationsFrom(
    summaryNode.type,
    "parent",
    false,
    "n/a",
  );
  const defaultChildAddableRelations = addableRelationsFrom(
    summaryNode.type,
    "child",
    false,
    "n/a",
  );

  const addableRelations = filterAddablesViaSearchRelations(
    defaultParentAddableRelations.concat(defaultChildAddableRelations),
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
