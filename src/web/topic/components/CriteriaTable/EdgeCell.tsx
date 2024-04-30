import styled from "@emotion/styled";

import { Edge } from "../../utils/graph";
import { CommonIndicators } from "../Indicator/CommonIndicators";
import { ContentIndicators } from "../Indicator/ContentIndicators";

export const EdgeCell = ({ edge }: { edge: Edge }) => {
  return (
    <StyledDiv>
      <CommonIndicators graphPartId={edge.id} notes={edge.data.notes} />
      <StyledContentIndicators graphPartId={edge.id} color="paper" />
    </StyledDiv>
  );
};

const StyledContentIndicators = styled(ContentIndicators)`
  margin-left: 0;
`;

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;
