import { useTheme } from "@emotion/react";
import { Box } from "@mui/material";
import { useState } from "react";
import { PieChart } from "react-minimal-pie-chart";
import { Data } from "react-minimal-pie-chart/types/commonTypes";

import { setScore } from "../../store/actions";
import { ArguableType, Score, possibleScores } from "../../utils/diagram";

interface Props {
  pieDiameter: number;
  arguableId: string;
  arguableType: ArguableType;
}

export const ScorePie = ({ pieDiameter, arguableId, arguableType }: Props) => {
  const theme = useTheme();
  const [hovered, setHovered] = useState<number | undefined>(undefined);

  const data: Data = possibleScores.map((score, index) => {
    return {
      value: 1,
      color: hovered === index ? theme.palette.neutral.dark : theme.palette.neutral.main,
      key: score,
    };
  });

  return (
    <Box display="flex" width={pieDiameter} height={pieDiameter}>
      <PieChart
        data={data}
        radius={50} // is relative to viewbox size [100, 100]
        label={({ dataEntry }) => dataEntry.key}
        labelStyle={() => ({
          fontSize: "14", // is relative to viewbox size [100, 100]
          pointerEvents: "none",
        })}
        segmentsStyle={{
          transition: theme.transitions.create("all", {
            duration: theme.transitions.duration.shortest,
          }),
          cursor: "pointer",
        }}
        labelPosition={70} // percent of radius
        startAngle={-90 - 360 / possibleScores.length / 2} // shift first slice to top center
        onMouseOver={(_, index) => setHovered(index)}
        onMouseOut={() => setHovered(undefined)}
        onClick={(_, dataIndex) => setScore(arguableId, arguableType, data[dataIndex].key as Score)}
        background="white"
      />
    </Box>
  );
};
