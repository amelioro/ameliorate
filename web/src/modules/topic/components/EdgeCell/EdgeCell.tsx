import { Edge } from "../../utils/diagram";
import { EdgeIndicatorGroup } from "../EdgeIndicatorGroup/EdgeIndicatorGroup";
import { StyledDiv } from "./EdgeCell.styles";

export const EdgeCell = ({ edge }: { edge: Edge }) => {
  return (
    <StyledDiv>
      <EdgeIndicatorGroup edge={edge} />
    </StyledDiv>
  );
};
