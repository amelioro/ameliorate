import { Edge } from "../../utils/graph";
import { CommonIndicators } from "../Indicator/CommonIndicators";
import { ContentIndicators } from "../Indicator/ContentIndicators";

export const EdgeCell = ({ edge }: { edge: Edge }) => {
  return (
    <div className="flex h-full items-center justify-center">
      <CommonIndicators graphPartId={edge.id} notes={edge.data.notes} />
      <ContentIndicators className="ml-0" graphPartId={edge.id} color="paper" />
    </div>
  );
};
