import { QuestionMark } from "@mui/icons-material";
import { type ButtonProps } from "@mui/material";
import { useCallback } from "react";

import { setSelected } from "../../../view/navigateStore";
import { useExploreNodes } from "../../store/graphPartHooks";
import { useDisplayScoresByGraphPart } from "../../store/scoreHooks";
import { GraphPart, Score } from "../../utils/graph";
import { getNumericScore, scoreColors } from "../../utils/score";
import { viewDetails } from "../TopicPane/TopicPane";
import { Indicator } from "./Indicator";

interface Props {
  graphPart: GraphPart;
}

export const QuestionIndicator = ({ graphPart }: Props) => {
  const { questions } = useExploreNodes(graphPart.id);
  const scoresByGraphPart = useDisplayScoresByGraphPart(questions.map((question) => question.id));

  const onClick = useCallback(() => {
    setSelected(graphPart.id);
    viewDetails();
  }, [graphPart.id]);

  if (questions.length === 0) return <></>;

  const questionScores = Object.values(scoresByGraphPart).map((score) => getNumericScore(score));
  const highestScore = Math.max(...questionScores);

  const color =
    highestScore > 5
      ? (scoreColors[highestScore.toString() as Score] as ButtonProps["color"])
      : undefined;

  const Icon = QuestionMark;

  return (
    <Indicator
      Icon={Icon}
      title={`Has ${questions.length} questions`}
      onClick={onClick}
      iconHasBackground={false}
      color={color}
    />
  );
};
