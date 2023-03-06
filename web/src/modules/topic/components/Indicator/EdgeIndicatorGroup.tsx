import { Edge } from "../../utils/diagram";
import { EdgeClaimIndicator } from "../Indicator/EdgeClaimIndicator";
import { ScoreDial } from "../ScoreDial/ScoreDial";

export const EdgeIndicatorGroup = ({ edge }: { edge: Edge }) => {
  return (
    <div>
      <EdgeClaimIndicator edge={edge} />
      <ScoreDial arguableId={edge.id} arguableType="edge" score={edge.data.score} />
    </div>
  );
};
