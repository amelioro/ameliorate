import { Timeline } from "@mui/icons-material";
import { Divider } from "@mui/material";

import { effectsDirectedSearchRelations } from "@/web/summary/aspectFilter";
import { IndirectHelpIcon } from "@/web/summary/components/IndirectHelpIcon";
import { Row } from "@/web/summary/components/Row";
import { AddNodeButtonGroup } from "@/web/topic/components/Node/AddNodeButtonGroup";
import { useEffectType } from "@/web/topic/diagramStore/nodeTypeHooks";
import { useEffects } from "@/web/topic/diagramStore/summary";
import { addableRelationsFrom, filterAddablesViaSearchRelations } from "@/web/topic/utils/edge";
import { Node } from "@/web/topic/utils/graph";
import { nodeDecorations } from "@/web/topic/utils/node";

interface Props {
  summaryNode: Node;
}

export const EffectsColumn = ({ summaryNode }: Props) => {
  const { directNodes, indirectNodes } = useEffects(summaryNode);
  const effectType = useEffectType(summaryNode.id);

  // need to grab both parent and child relations because effects cause further effects in direction
  // that is based on whether they're problem effects or solution effects (e.g. problem effects
  // chain downwards via child relations).
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
    effectsDirectedSearchRelations,
  );

  const AddButtons = (
    <div className="pb-1.5">
      <AddNodeButtonGroup fromNodeId={summaryNode.id} addableRelations={addableRelations} />
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
