import { Typography, styled } from "@mui/material";
import { ReactNode } from "react";

import { compareNodesByType } from "@/common/node";
import { useSessionUser } from "@/web/common/hooks";
import { EditableNode } from "@/web/topic/components/Node/EditableNode";
import { useDisplayScores } from "@/web/topic/diagramStore/scoreHooks";
import { useUserCanEditTopicData } from "@/web/topic/topicStore/store";
import { Node } from "@/web/topic/utils/graph";
import { MuiIcon } from "@/web/topic/utils/node";
import { getNumericScore } from "@/web/topic/utils/score";

interface Props {
  title: string;
  Icon: MuiIcon;
  nodes: Node[];
  addButtonsSlot?: ReactNode;
  endHeaderSlot?: ReactNode;
  actionSlot?: ReactNode;
}

export const Row = ({ title, Icon, nodes, addButtonsSlot, endHeaderSlot, actionSlot }: Props) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const { scoresByGraphPartId } = useDisplayScores(nodes.map((node) => node.id));

  const nodesSortedByScoreThenType = nodes.toSorted((node1, node2) => {
    const score1 = getNumericScore(scoresByGraphPartId[node1.id] ?? "-");
    const score2 = getNumericScore(scoresByGraphPartId[node2.id] ?? "-");

    if (score1 !== score2) return score2 - score1; // sort by score descending

    return compareNodesByType(node1, node2);
  });

  return (
    <div className="flex flex-col gap-1">
      <HeaderDiv className="flex items-center justify-between">
        <LeftHeaderDiv className="flex gap-1">
          <Icon fontSize="small" />
          <Typography variant="body2">{title}</Typography>
          {endHeaderSlot}
        </LeftHeaderDiv>

        {actionSlot && <RightHeaderDiv>{actionSlot}</RightHeaderDiv>}
      </HeaderDiv>

      {addButtonsSlot && userCanEditTopicData && (
        <div className="flex justify-center">{addButtonsSlot}</div>
      )}

      <ContentDiv className="flex flex-wrap justify-center gap-2.5 p-0.5 lg:gap-4">
        {nodes.length === 0 ? (
          <Typography variant="body2">No nodes yet!</Typography>
        ) : (
          nodesSortedByScoreThenType.map((node) => (
            <EditableNode key={node.id} node={node} className="[zoom:80%] lg:[zoom:normal]" />
          ))
        )}
      </ContentDiv>
    </div>
  );
};

const HeaderDiv = styled("div")``;
const LeftHeaderDiv = styled("div")``;
const RightHeaderDiv = styled("div")``;
const ContentDiv = styled("div")``;
