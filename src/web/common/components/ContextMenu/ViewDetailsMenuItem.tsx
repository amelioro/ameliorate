import { ContextMenuItem } from "@/web/common/components/ContextMenu/CloseOnClickMenuItem";
import { emitter } from "@/web/common/event";
import { GraphPart } from "@/web/topic/utils/graph";
import { setSelected } from "@/web/view/selectedPartStore";

export const ViewDetailsMenuItem = ({ graphPart }: { graphPart: GraphPart }) => {
  return (
    <ContextMenuItem
      onClick={() => {
        setSelected(graphPart.id);
        emitter.emit("viewBasics");
      }}
    >
      View details
    </ContextMenuItem>
  );
};
