import { QuestionMark } from "@mui/icons-material";
import { type ButtonProps } from "@mui/material";
import { useCallback } from "react";

import { emitter } from "@/web/common/event";
import { ContentIndicator } from "@/web/topic/components/Indicator/Base/ContentIndicator";
import { useResearchNodes } from "@/web/topic/diagramStore/graphPartHooks";
import { useDisplayScores } from "@/web/topic/diagramStore/scoreHooks";
import { getHighestScore, getScoreColor } from "@/web/topic/utils/score";
import { setSelected } from "@/web/view/selectedPartStore";

interface Props {
  graphPartId: string;
  partColor: ButtonProps["color"];
}

export const QuestionIndicator = ({ graphPartId, partColor }: Props) => {
  const { questions } = useResearchNodes(graphPartId);
  const { scoresByGraphPartId, scoreMeaning } = useDisplayScores(
    questions.map((question) => question.id),
  );

  const onClick = useCallback(() => {
    setSelected(graphPartId);
    emitter.emit("viewResearch");
  }, [graphPartId]);

  if (questions.length === 0) return <></>;

  const highestScore = getHighestScore(Object.values(scoresByGraphPartId));
  // could just color if score is > 5, to avoid bringing attention to unimportant things, but it seems nice to have the visual indication of a low score too
  const scoreColor = getScoreColor(highestScore, scoreMeaning) as ButtonProps["color"];

  const Icon = QuestionMark;

  return (
    <ContentIndicator
      Icon={Icon}
      title={`Has ${questions.length} questions`}
      onClick={onClick}
      color={scoreColor ?? partColor}
    />
  );
};
