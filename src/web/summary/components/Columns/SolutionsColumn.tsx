import { Timeline } from "@mui/icons-material";
import { Divider, Link } from "@mui/material";

import { solutionsDirectedSearchRelations } from "@/web/summary/aspectFilter";
import { IndirectHelpIcon } from "@/web/summary/components/IndirectHelpIcon";
import { Row } from "@/web/summary/components/Row";
import { AddNodeButtonGroup } from "@/web/topic/components/Node/AddNodeButtonGroup";
import { useEffectType } from "@/web/topic/diagramStore/nodeTypeHooks";
import { useSolutions } from "@/web/topic/diagramStore/summary";
import { addableRelationsFrom, filterAddablesViaSearchRelations } from "@/web/topic/utils/edge";
import { Node } from "@/web/topic/utils/graph";
import { nodeDecorations } from "@/web/topic/utils/nodeDecoration";
import { viewCriteriaTable } from "@/web/view/currentViewStore/filter";

interface Props {
  summaryNode: Node;
}

export const SolutionsColumn = ({ summaryNode }: Props) => {
  const { directNodes, indirectNodes } = useSolutions(summaryNode);
  const effectType = useEffectType(summaryNode.id);

  const defaultAddableRelations = addableRelationsFrom(
    summaryNode.type,
    undefined,
    false,
    effectType, // in case summaryNode is a solution detriment, and we want to show mitgations
  );

  const addableRelations = filterAddablesViaSearchRelations(
    defaultAddableRelations,
    solutionsDirectedSearchRelations,
  );

  const AddButtons = (
    <div className="pb-1.5">
      <AddNodeButtonGroup fromNodeId={summaryNode.id} addableRelations={addableRelations} />
    </div>
  );

  const viewTableAction =
    summaryNode.type === "problem" &&
    directNodes.filter((node) => node.type === "solution").length > 1 ? (
      <Link component="button" variant="body2" onClick={() => viewCriteriaTable(summaryNode.id)}>
        View tradeoffs table
      </Link>
    ) : (
      <></>
    );

  return (
    <div className="flex flex-col">
      <Row
        title="Solutions"
        Icon={nodeDecorations.solution.NodeIcon}
        addButtonsSlot={AddButtons}
        actionSlot={viewTableAction}
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
