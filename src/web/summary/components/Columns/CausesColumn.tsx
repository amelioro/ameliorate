import { Timeline } from "@mui/icons-material";
import { Divider } from "@mui/material";

import { causesDirectedSearchRelations } from "@/web/summary/aspectFilter";
import { IndirectHelpIcon } from "@/web/summary/components/IndirectHelpIcon";
import { Row } from "@/web/summary/components/Row";
import { AddNodeButtonGroup } from "@/web/topic/components/Node/AddNodeButtonGroup";
import { useEffectType } from "@/web/topic/diagramStore/nodeTypeHooks";
import { useCauses } from "@/web/topic/diagramStore/summary";
import { addableRelationsFrom, filterAddablesViaSearchRelations } from "@/web/topic/utils/edge";
import { Node } from "@/web/topic/utils/graph";
import { nodeDecorations } from "@/web/topic/utils/node";

interface Props {
  summaryNode: Node;
}

export const CausesColumn = ({ summaryNode }: Props) => {
  const { directNodes, indirectNodes } = useCauses(summaryNode);
  const effectType = useEffectType(summaryNode.id);

  // need to grab both parent and child relations because causes cause further effects in direction
  // that is based on whether they're relation to problems or solutions (e.g. causes cause problems
  // upwards via parent relations, and cause solutions downwards via child relations).
  const defaultParentAddableRelations = addableRelationsFrom(
    summaryNode.type,
    "parent",
    false,
    effectType,
  );
  const defaultChildAddableRelations = addableRelationsFrom(
    summaryNode.type,
    "child",
    false,
    effectType,
  );

  const addableRelations = filterAddablesViaSearchRelations(
    defaultParentAddableRelations.concat(defaultChildAddableRelations),
    causesDirectedSearchRelations,
  );

  const AddButtons = (
    <div className="pb-1.5">
      <AddNodeButtonGroup fromNodeId={summaryNode.id} addableRelations={addableRelations} />
    </div>
  );

  return (
    <div className="flex flex-col">
      <Row
        title="Causes"
        Icon={nodeDecorations.cause.NodeIcon}
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
