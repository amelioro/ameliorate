import { type ButtonProps } from "@mui/material";
import { MutableRefObject } from "react";

import { StyledButton } from "@/web/topic/components/Score/ScoreButton.styles";
import { ScoreCompare } from "@/web/topic/components/Score/ScoreCompare";
import { type Score as ScoreData } from "@/web/topic/utils/graph";
import { indicatorLengthRem } from "@/web/topic/utils/node";
import { getAverageScore, scoreColors } from "@/web/topic/utils/score";

export const buttonDiameterRem = indicatorLengthRem; //rem

interface ScoreButtonProps {
  buttonRef?: MutableRefObject<HTMLButtonElement | null>;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  zoomRatio?: number;
  userScores: Record<string, ScoreData>;
}

export const ScoreButton = ({
  buttonRef,
  onClick,
  onMouseEnter,
  onMouseLeave,
  zoomRatio = 1,
  userScores,
}: ScoreButtonProps) => {
  const isComparing = Object.keys(userScores).length > 1;

  const buttonScore = getAverageScore(Object.values(userScores));
  const scoreColor = scoreColors[buttonScore] as ButtonProps["color"]; // not sure how to type this without type assertion, while still being able to access palette with it

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
          ` ${isComparing ? "pointer-events-none z-0 bg-transparent" : ""}` +
          ` ${onClick ? "" : "pointer-events-none"}`
        }
      >
        {isComparing && (
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
