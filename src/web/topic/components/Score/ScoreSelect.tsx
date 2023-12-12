import { useTheme } from "@emotion/react";
import { type PaletteColor } from "@mui/material";
import { Data } from "react-minimal-pie-chart/types/commonTypes";

import { setScore } from "../../store/actions";
import { Score, possibleScores } from "../../utils/graph";
import { scoreColors } from "../../utils/score";
import { CustomDataEntry, PieChart } from "./PieChart";

interface Props {
  username: string;
  graphPartId: string;
}

export const ScoreSelect = ({ username, graphPartId }: Props) => {
  const theme = useTheme();

  const data: Data<CustomDataEntry> = possibleScores.map((score) => {
    const scoreColor = scoreColors[score];
    const paletteColor = theme.palette[scoreColor] as PaletteColor; // not sure how to guarantee this type, since palette has non-PaletteColor keys

    return {
      value: 1,
      color: paletteColor.main,
      hoverColor: paletteColor.dark,
      key: score,
    };
  });

  return (
    <PieChart
      onClick={(segmentData) => setScore(username, graphPartId, segmentData.key as Score)}
      customData={data}
      startAngle={-90 - 360 / possibleScores.length / 2} // shift first slice to top center
    />
  );
};
