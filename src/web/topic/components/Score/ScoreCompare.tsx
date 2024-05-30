import { useTheme } from "@emotion/react";
import { type PaletteColor } from "@mui/material";
import get from "lodash/get";
import reduce from "lodash/reduce";
import set from "lodash/set";
import { Data } from "react-minimal-pie-chart/types/commonTypes";

import { CustomDataEntry, PieChart } from "@/web/topic/components/Score/PieChart";
import { Score } from "@/web/topic/utils/graph";
import { scoreColors } from "@/web/topic/utils/score";

interface Props {
  userScores: Record<string, Score>;
  type?: "regular" | "button";
}

export const ScoreCompare = ({ userScores, type = "regular" }: Props) => {
  const theme = useTheme();

  const scoreUsers = reduce(
    userScores,
    (result, score, username) => {
      const usernamesForScore = get(result, score, []);
      return set(result, score, [...usernamesForScore, username]);
    },
    {} as Partial<Record<Score, string[]>>
  );

  const data: Data<CustomDataEntry> = Object.entries(scoreUsers).map(([score, usernames]) => {
    const scoreColor = scoreColors[score as Score]; // not sure how to ensure Object.entries remembers score type
    const paletteColor = theme.palette[scoreColor] as PaletteColor; // not sure how to guarantee this type, since palette has non-PaletteColor keys

    return {
      value: usernames.length,
      color: paletteColor.main,
      hoverColor: paletteColor.dark,
      key: score,
      title:
        type === "regular" ? `Users who scored ${score}:\n\n${usernames.join("\n")}` : undefined,
    };
  });

  return (
    <PieChart
      customData={data}
      startAngle={-90} // low numbers starting from top, similar to score select
      type={type}
    />
  );
};
