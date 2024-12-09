import { ContextMenuItem } from "@/web/common/components/ContextMenu/CloseOnClickMenuItem";
import { diagramPartContextMethods } from "@/web/topic/utils/diagramPartContext";
import { GraphPart, isNode } from "@/web/topic/utils/graph";

export const ViewContextInDiagramMenuItem = ({ graphPart }: { graphPart: GraphPart }) => {
  const partType = isNode(graphPart) ? graphPart.type : graphPart.label;
  const viewContext = diagramPartContextMethods[partType]?.viewContext;

  if (!viewContext) return <></>;

  return (
    <ContextMenuItem onClick={() => viewContext(graphPart.id)}>
      View context in diagram
    </ContextMenuItem>
  );
};
