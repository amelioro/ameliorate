import { ContextMenuItem } from "@/web/common/components/ContextMenu/CloseOnClickMenuItem";
import { emitter } from "@/web/common/event";
import { setSelected } from "@/web/view/selectedPartStore";

export const ViewDetailsMenuItem = ({ graphPart }: { graphPart: { id: string } }) => {
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
