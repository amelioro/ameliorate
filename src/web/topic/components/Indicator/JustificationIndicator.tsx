import { ThumbDownOutlined, ThumbUpOutlined, ThumbsUpDownOutlined } from "@mui/icons-material";
import { type ButtonProps } from "@mui/material";
import { useCallback } from "react";

import { emitter } from "@/web/common/event";
import { Indicator } from "@/web/topic/components/Indicator/Indicator";
import { useTopLevelClaims } from "@/web/topic/store/graphPartHooks";
import { useDisplayScores } from "@/web/topic/store/scoreHooks";
import { Score } from "@/web/topic/utils/graph";
import { getNumericScore, scoreColors } from "@/web/topic/utils/score";
import { setSelected } from "@/web/view/currentViewStore/store";

interface Props {
  graphPartId: string;
  partColor: ButtonProps["color"];
}

export const JustificationIndicator = ({ graphPartId, partColor }: Props) => {
  const { supports, critiques } = useTopLevelClaims(graphPartId);
  const justificationNodes = supports.concat(critiques);
  const scoresByGraphPart = useDisplayScores(justificationNodes.map((node) => node.id));

  const onClick = useCallback(() => {
    setSelected(graphPartId);
    emitter.emit("viewTopicDetails");
  }, [graphPartId]);

  if (justificationNodes.length === 0) return <></>;

  const nodeScores = Object.values(scoresByGraphPart).map((score) => getNumericScore(score));
  const highestScore = Math.max(...nodeScores);

  // could just color if score is > 5, to avoid bringing attention to unimportant things, but it seems nice to have the visual indication of a low score too
  const scoreColor = scoreColors[highestScore.toString() as Score] as ButtonProps["color"];

  if (supports.length > 0 && critiques.length > 0)
    return (
      <Indicator
        Icon={ThumbsUpDownOutlined}
        title={`Has ${supports.length} supports and ${critiques.length} critiques`}
        onClick={onClick}
        iconHasBackground={false}
        color={partColor}
      />
    );
  else if (supports.length > 0)
    return (
      <Indicator
        Icon={ThumbUpOutlined}
        title={`Has ${supports.length} supports`}
        onClick={onClick}
        iconHasBackground={false}
        color={scoreColor ?? partColor}
      />
    );
  else
    return (
      <Indicator
        Icon={ThumbDownOutlined}
        title={`Has ${critiques.length} critiques`}
        onClick={onClick}
        iconHasBackground={false}
        color={scoreColor ?? partColor}
      />
    );
};
