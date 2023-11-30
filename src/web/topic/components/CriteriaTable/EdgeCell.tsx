import { Edge } from "../../utils/graph";
import { EdgeIndicatorGroup } from "../Indicator/EdgeIndicatorGroup";
import { StyledDiv } from "./EdgeCell.styles";

export const EdgeCell = ({ edge }: { edge: Edge }) => {
  return (
    <StyledDiv>
      <EdgeIndicatorGroup edge={edge} />
    </StyledDiv>
  );
};
