import { StyledDiv } from "@/web/topic/components/CriteriaTable/NodeCell.styles";
import { EditableNode } from "@/web/topic/components/Node/EditableNode";
import { Node } from "@/web/topic/utils/graph";

export const NodeCell = ({ node }: { node: Node }) => {
  return (
    <StyledDiv>
      <EditableNode node={node} context="table" />
    </StyledDiv>
  );
};
