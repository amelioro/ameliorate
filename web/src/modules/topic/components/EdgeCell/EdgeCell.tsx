import { Edge } from "../../utils/diagram";
import { ScoreDial } from "../ScoreDial/ScoreDial";
import { StyledDiv } from "./EdgeCell.styles";

export const EdgeCell = ({ edge }: { edge: Edge }) => {
  const score = edge.data.score;

  return (
    <StyledDiv>
      <ScoreDial score={score} scorableId={edge.id} scorableType="edge" />
    </StyledDiv>
  );
};
