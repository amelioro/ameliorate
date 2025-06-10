import { type Palette } from "@mui/material";
import { maxBy, mean, meanBy, round } from "es-toolkit";

import { Score } from "@/web/topic/utils/graph";

// could have average in here too but average of importance still means importance and seems like it should use the same colors
// TODO? probably add "truth" as a type here, for edges
export type ScoreMeaning = "importance" | "disagreement";

export const getScoreMeaning = (numPerspectives: number, aggregationMode: string): ScoreMeaning => {
  if (numPerspectives > 1 && aggregationMode === "disagreement") return "disagreement";
  else return "importance";
};

export const getScoreColor = (score: Score, scoreMeaning: ScoreMeaning): keyof Palette => {
  if (scoreMeaning === "disagreement") return disagreementScoreColors[score];
  else return defaultScoreColors[score];
};

export const getHighestScore = (scores: Score[]): Score => {
  return maxBy(scores, (score) => Object.keys(defaultScoreColors).indexOf(score)) ?? "-";
};

// Generally use red to convey negative meaning, white for neutral, and blue for positive.
const defaultScoreColors: Record<Score, keyof Palette> = {
  "-": "paperPlain",
  "1": "critique1",
  "2": "critique2",
  "3": "critique3",
  "4": "critique4",
  "5": "paperPlain",
  "6": "support4",
  "7": "support3",
  "8": "support2",
  "9": "support1",
};

// Treat all of these as "negative" - disagreement isn't necessarily inherently bad, but want to highlight it.
// Could be more precise by adding a unique color per score, but reusing the 4 critique colors seems ok enough.
const disagreementScoreColors: Record<Score, keyof Palette> = {
  "-": "paperPlain",
  "1": "paperPlain",
  "2": "critique4",
  "3": "critique4",
  "4": "critique3",
  "5": "critique3",
  "6": "critique2",
  "7": "critique2",
  "8": "critique1",
  "9": "critique1",
};

export const aggregationModes = ["average", "disagreement"] as const;
export type AggregationMode = (typeof aggregationModes)[number];

export const getDisplayScore = (userScores: Score[], aggregationMode: AggregationMode): Score => {
  const isComparing = userScores.length > 1;
  if (!isComparing) return userScores[0] ?? "-";

  return aggregationMode === "average"
    ? getAverageScore(userScores)
    : getDisagreementScore(userScores);
};

const getAverageScore = (userScores: Score[]): Score => {
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

const getDisagreementScore = (userScores: Score[]): Score => {
  const numericScores = userScores.map(getNumericScore);
  const scoreAverage = mean(numericScores);
  const scoreVariance = meanBy(numericScores, (score) => Math.pow(score - scoreAverage, 2));
  const standardDeviation = Math.sqrt(scoreVariance);

  if (standardDeviation === 0) return "-"; // no disagreement

  // note: min deviation = 0, max = 4: e.g. one 1 and one 9, mean = 5, variance = 16, deviation = 4
  const deviationInScoreRange = standardDeviation * (8.0 / 4) + 1; // convert 0-4 to 1-9 range

  const disagreementScore = round(deviationInScoreRange).toString() as Score;
  return disagreementScore;
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
