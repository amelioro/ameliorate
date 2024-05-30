import { useTheme } from "@emotion/react";
import { type PaletteColor } from "@mui/material";
import { Data } from "react-minimal-pie-chart/types/commonTypes";

import { CustomDataEntry, PieChart } from "@/web/topic/components/Score/PieChart";
import { setScore } from "@/web/topic/store/actions";
import { Score, possibleScores } from "@/web/topic/utils/graph";
import { scoreColors } from "@/web/topic/utils/score";

interface Props {
  username: string;
  graphPartId: string;
  onSelect: () => void;
}

export const ScoreSelect = ({ username, graphPartId, onSelect }: Props) => {
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
      onClick={(segmentData) => {
        setScore(username, graphPartId, segmentData.key as Score);
        onSelect();
      }}
      customData={data}
      startAngle={-90 - 360 / possibleScores.length / 2} // shift first slice to top center
    />
  );
};
