import { ContextMenuItem } from "@/web/common/components/ContextMenu/CloseOnClickMenuItem";
import { GraphPart, isNode } from "@/web/topic/utils/graph";
import { contextMethods } from "@/web/topic/utils/partContext";

export const ViewContextMenuItem = ({ graphPart }: { graphPart: GraphPart }) => {
  const partType = isNode(graphPart) ? graphPart.type : graphPart.label;
  const viewContext = contextMethods[partType]?.viewContext;

  if (!viewContext) return <></>;

  return <ContextMenuItem onClick={() => viewContext(graphPart.id)}>View context</ContextMenuItem>;
};
