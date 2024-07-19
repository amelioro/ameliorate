import { type Palette } from "@mui/material";
import meanBy from "lodash/meanBy";
import round from "lodash/round";

import { Score } from "@/web/topic/utils/graph";

export const scoreColors: Record<Score, keyof Palette> = {
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

export const getAverageScore = (userScores: Score[]): Score => {
  const isComparing = userScores.length > 1;
  if (!isComparing) return userScores[0] ?? "-";

  if (userScores.every((score) => score === "-")) return "-";

  // average the scores, removing unscored ("-") from the calc
  const roundedAverage = round(
    meanBy(
      userScores.filter((score) => score !== "-"),
      (score) => Number(score),
    ),
  );

  return roundedAverage.toString() as Score; // average should still result in a Score
};

export const getNumericScore = (score: Score): number => {
  return score === "-" ? 5 : Number(score);
};

// hard to say if this is worth extracting, but at least it guarantees some commonality between
// checking editability for the hotkey implementation and the implementation in the Score component
export const userCanEditScores = (
  username: string | undefined,
  perspectives: string[],
  readonlyMode: boolean,
): username is string => {
  return (
    !readonlyMode &&
    perspectives.length === 1 &&
    username !== undefined &&
    perspectives[0] === username
  );
};
