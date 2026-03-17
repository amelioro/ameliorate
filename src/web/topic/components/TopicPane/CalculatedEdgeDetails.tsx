import { type CalculatedEdge } from "@/common/edge";
import { HiddenPathPanel } from "@/web/topic/components/Edge/HiddenPathPanel";

interface Props {
  indirectEdge: CalculatedEdge;
}

export const CalculatedEdgeDetails = ({ indirectEdge }: Props) => {
  return (
    <div className="m-3 rounded-xl border">
      <HiddenPathPanel indirectEdge={indirectEdge} />
    </div>
  );
};
