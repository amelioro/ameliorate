import { IndirectEdge } from "@/web/topic/components/Edge/IndirectEdge";
import { useIndirectEdge } from "@/web/topic/diagramStore/filteredDiagramStore";
import { FlowEdgeProps } from "@/web/topic/utils/flowUtils";

export const FlowIndirectEdge = (flowEdge: FlowEdgeProps) => {
  const indirectEdge = useIndirectEdge(flowEdge.id);

  if (!indirectEdge) return null;

  return <IndirectEdge edge={indirectEdge} edgeLayoutData={flowEdge.data} inReactFlow={true} />;
};
