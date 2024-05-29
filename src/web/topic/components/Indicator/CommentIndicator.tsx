import { ChatBubbleOutline } from "@mui/icons-material";
import { type ButtonProps } from "@mui/material";
import { useCallback } from "react";

import { useCommentCount } from "../../../comment/store/commentStore";
import { setSelected } from "../../../view/currentViewStore/store";
import { useShowResolvedComments } from "../../../view/miscTopicConfigStore";
import { GraphPartType } from "../../utils/graph";
import { viewDetails } from "../TopicPane/paneStore";
import { Indicator } from "./Indicator";

interface Props {
  graphPartId: string;
  graphPartType: GraphPartType;
  partColor: ButtonProps["color"];
}

export const CommentIndicator = ({ graphPartId, graphPartType, partColor }: Props) => {
  const showResolved = useShowResolvedComments();
  const commentCount = useCommentCount(graphPartId, graphPartType, showResolved);

  const onClick = useCallback(() => {
    setSelected(graphPartId);
    viewDetails();
  }, [graphPartId]);

  if (commentCount === 0) return <></>;

  return (
    <Indicator
      Icon={ChatBubbleOutline}
      title={`Has ${commentCount} threads`} // could count total comments as well but logic is more annoying, and doesn't seem that important
      onClick={onClick}
      iconHasBackground={false}
      color={partColor}
    />
  );
};
