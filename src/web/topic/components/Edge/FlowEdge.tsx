import { DirectEdge } from "@/web/topic/components/Edge/DirectEdge";
import { useEdge } from "@/web/topic/diagramStore/edgeHooks";
import { FlowEdgeProps } from "@/web/topic/utils/flowUtils";

export const FlowEdge = (flowEdge: FlowEdgeProps) => {
  const edge = useEdge(flowEdge.id);

  if (!edge) return null;

  return <DirectEdge edge={edge} edgeLayoutData={flowEdge.data} inReactFlow={true} />;
};
