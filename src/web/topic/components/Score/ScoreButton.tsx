import { type ButtonProps } from "@mui/material";
import { MouseEventHandler, MutableRefObject } from "react";

import { StyledButton } from "@/web/topic/components/Score/ScoreButton.styles";
import { ScoreCompare } from "@/web/topic/components/Score/ScoreCompare";
import { type Score as ScoreData } from "@/web/topic/utils/graph";
import { indicatorLengthRem } from "@/web/topic/utils/node";
import {
  AggregationMode,
  getDisplayScore,
  getScoreColor,
  getScoreMeaning,
} from "@/web/topic/utils/score";

export const buttonDiameterRem = indicatorLengthRem; //rem

interface ScoreButtonProps {
  buttonRef?: MutableRefObject<HTMLButtonElement | null>;
  onClick?: MouseEventHandler;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  zoomRatio?: number;
  userScores: Record<string, ScoreData>;
  aggregationMode: AggregationMode;
  className?: string;
}

export const ScoreButton = ({
  buttonRef,
  onClick,
  onMouseEnter,
  onMouseLeave,
  zoomRatio = 1,
  userScores,
  aggregationMode,
  className = "",
}: ScoreButtonProps) => {
  const numPerspectives = Object.keys(userScores).length;
  const aggregating = numPerspectives > 1;
  // when showing the average, seeing a small score distribution via pie seems like nice context.
  // when showing disagreement, the color relevant to the disagreement score seems more useful.
  const showComparisonPie = aggregating && aggregationMode === "average";
  const scoreMeaning = getScoreMeaning(numPerspectives, aggregationMode);

  const buttonScore = getDisplayScore(Object.values(userScores), aggregationMode);
  const scoreColor = getScoreColor(buttonScore, scoreMeaning) as ButtonProps["color"]; // not sure how to type this without type assertion, while still being able to access palette with it

  return (
    <>
      <StyledButton
        ref={buttonRef}
        variant="contained"
        color={scoreColor}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        buttonDiameter={buttonDiameterRem}
        zoomRatio={zoomRatio}
        className={
          "shadow-none border border-solid border-neutral-main" +
          ` ${showComparisonPie ? "pointer-events-none z-0 bg-transparent" : ""}` +
          ` ${onClick ? "" : "pointer-events-none"}` +
          ` ${className}`
        }
      >
        {showComparisonPie && (
          <div
            // behind the button so the score shows in front of the pie
            className="absolute z-[-1] size-full"
          >
            <ScoreCompare userScores={userScores} type="button" />
          </div>
        )}

        {buttonScore}
      </StyledButton>
    </>
  );
};
