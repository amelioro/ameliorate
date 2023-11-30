import { Box, type ButtonProps, type Palette } from "@mui/material";
import meanBy from "lodash/meanBy";
import round from "lodash/round";
import { MutableRefObject } from "react";

import { Score, type Score as ScoreData } from "../../utils/graph";
import { indicatorLengthRem } from "../../utils/node";
import { StyledButton } from "./ScoreButton.styles";
import { ScoreCompare } from "./ScoreCompare";

export const scoreColors: Record<ScoreData, keyof Palette> = {
  "-": "neutral",
  "1": "critique1",
  "2": "critique2",
  "3": "critique3",
  "4": "critique4",
  "5": "paper",
  "6": "support4",
  "7": "support3",
  "8": "support2",
  "9": "support1",
};

export const buttonDiameterRem = indicatorLengthRem; //rem

const getButtonScore = (scores: ScoreData[]): Score => {
  const isComparing = scores.length > 1;
  if (!isComparing) return scores[0] ?? "-";

  if (scores.every((score) => score === "-")) return "-";

  // average the scores, removing unscored ("-") from the calc
  const roundedAverage = round(
    meanBy(
      scores.filter((score) => score !== "-"),
      (score) => Number(score)
    )
  );

  return roundedAverage.toString() as Score; // average should still result in a Score
};

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

  const buttonScore = getButtonScore(Object.values(userScores));
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
        sx={
          onClick
            ? isComparing
              ? {
                  backgroundColor: "rgba(0,0,0,0)", // transparent so that pie appears as a background
                  zIndex: "0", // allow the pie to show behind the button (while allow the score label to be in front of the pie)
                  pointerEvents: "none", // prevent score label from taking pointer events; pie can handle hover effects
                }
              : {}
            : { pointerEvents: "none" }
        }
      >
        {isComparing && (
          <Box
            position="absolute"
            width="100%"
            height="100%"
            zIndex="-1" // behind the button so the score shows in front of the pie
          >
            <ScoreCompare userScores={userScores} type="button" />
          </Box>
        )}

        {buttonScore}
      </StyledButton>
    </>
  );
};
