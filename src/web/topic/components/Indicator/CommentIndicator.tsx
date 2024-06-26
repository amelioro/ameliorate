import { ChatBubbleOutline } from "@mui/icons-material";
import { type ButtonProps } from "@mui/material";
import { useCallback } from "react";

import { useCommentCount } from "@/web/comment/store/commentStore";
import { emitter } from "@/web/common/event";
import { Indicator } from "@/web/topic/components/Indicator/Indicator";
import { GraphPartType } from "@/web/topic/utils/graph";
import { setSelected } from "@/web/view/currentViewStore/store";
import { useShowResolvedComments } from "@/web/view/miscTopicConfigStore";

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
    emitter.emit("viewTopicDetails");
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
