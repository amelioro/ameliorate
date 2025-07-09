import { ThumbDownOutlined, ThumbUpOutlined, ThumbsUpDownOutlined } from "@mui/icons-material";
import { type ButtonProps } from "@mui/material";
import { useCallback } from "react";

import { emitter } from "@/web/common/event";
import { ContentIndicator } from "@/web/topic/components/Indicator/Base/ContentIndicator";
import { useTopLevelJustification } from "@/web/topic/diagramStore/graphPartHooks";
import { useDisplayScores } from "@/web/topic/diagramStore/scoreHooks";
import { getHighestScore, getScoreColor } from "@/web/topic/utils/score";
import { setSelected } from "@/web/view/selectedPartStore";

interface Props {
  graphPartId: string;
  partColor: ButtonProps["color"];
}

export const JustificationIndicator = ({ graphPartId, partColor }: Props) => {
  const { supports, critiques } = useTopLevelJustification(graphPartId);
  const justificationNodes = supports.concat(critiques);
  const { scoresByGraphPartId, scoreMeaning } = useDisplayScores(
    justificationNodes.map((node) => node.id),
  );

  const onClick = useCallback(() => {
    setSelected(graphPartId);
    emitter.emit("viewJustification");
  }, [graphPartId]);

  if (justificationNodes.length === 0) return <></>;

  const highestScore = getHighestScore(Object.values(scoresByGraphPartId));
  // could just color if score is > 5, to avoid bringing attention to unimportant things, but it seems nice to have the visual indication of a low score too
  const scoreColor = getScoreColor(highestScore, scoreMeaning) as ButtonProps["color"];
  // paperPlain is a color intended to not stand out here - use the part's color in this case so it blends in with the part better
  const color = scoreColor === "paperPlain" ? partColor : scoreColor ?? partColor;

  if (supports.length > 0 && critiques.length > 0)
    return (
      <ContentIndicator
        Icon={ThumbsUpDownOutlined}
        title={`Has ${supports.length} supports and ${critiques.length} critiques`}
        onClick={onClick}
        color={partColor}
      />
    );
  else if (supports.length > 0)
    return (
      <ContentIndicator
        Icon={ThumbUpOutlined}
        title={`Has ${supports.length} supports`}
        onClick={onClick}
        color={color}
      />
    );
  else
    return (
      <ContentIndicator
        Icon={ThumbDownOutlined}
        title={`Has ${critiques.length} critiques`}
        onClick={onClick}
        color={color}
      />
    );
};
