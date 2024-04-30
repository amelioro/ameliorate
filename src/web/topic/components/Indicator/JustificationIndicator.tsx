import { ThumbDownOutlined, ThumbUpOutlined, ThumbsUpDownOutlined } from "@mui/icons-material";
import { type ButtonProps } from "@mui/material";
import { useCallback } from "react";

import { setSelected } from "../../../view/navigateStore";
import { useTopLevelClaims } from "../../store/graphPartHooks";
import { useDisplayScores } from "../../store/scoreHooks";
import { Score } from "../../utils/graph";
import { getNumericScore, scoreColors } from "../../utils/score";
import { viewDetails } from "../TopicPane/paneStore";
import { Indicator } from "./Indicator";

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
    viewDetails();
  }, [graphPartId]);

  if (justificationNodes.length === 0) return <></>;

  const nodeScores = Object.values(scoresByGraphPart).map((score) => getNumericScore(score));
  const highestScore = Math.max(...nodeScores);

  const scoreColor =
    highestScore > 5
      ? (scoreColors[highestScore.toString() as Score] as ButtonProps["color"])
      : undefined;

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
