import { NodeType } from "../../../../common/node";
import { useSessionUser } from "../../../common/hooks";
import { addNode } from "../../store/createDeleteActions";
import { useUserCanEditTopicData } from "../../store/userHooks";
import { Relation } from "../../utils/edge";
import { type RelationDirection } from "../../utils/graph";
import { nodeDecorations } from "../../utils/node";
import { StyledButton } from "./AddNodeButton.styles";

interface Props {
  fromPartId: string;
  as: RelationDirection;
  toNodeType: NodeType;
  relation: Relation;
  /**
   * Generally want to select the new node to highlight it in the view, but some cases we want to
   * avoid changing selection so that the view isn't impacted as much (e.g. from the details pane)
   */
  selectNewNode?: boolean;
  className?: string;
}

export const AddNodeButton = ({
  fromPartId,
  as,
  toNodeType,
  relation,
  selectNewNode,
  className,
}: Props) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  if (!userCanEditTopicData) return <></>;

  const decoration = nodeDecorations[toNodeType];

  return (
    <StyledButton
      className={className}
      color={toNodeType}
      size="small"
      variant="contained"
      onClick={(event) => {
        event.stopPropagation(); // don't trigger selection of node
        addNode({ fromPartId, as, toNodeType, relation, selectNewNode });
      }}
      // Not using MUI Tooltip because it throws anchorEl missing error when the button is hidden
      // after hovering it. Think we'd have to pass `show` into this component in order to hide
      // the tooltip at the same time as the button, rather than relying on css from the FlowNode,
      // but that'd be slightly annoying to do.
      title={`Add new ${decoration.title}`}
      aria-label={`Add new ${decoration.title}`}
    >
      <decoration.NodeIcon />
    </StyledButton>
  );
};
