import { useTheme } from "@emotion/react";
import { type PaletteColor } from "@mui/material";
import { useState } from "react";
import { PieChart } from "react-minimal-pie-chart";
import { Data } from "react-minimal-pie-chart/types/commonTypes";

import { setScore } from "../../store/actions";
import { ArguableType, Score, possibleScores } from "../../utils/diagram";
import { scoreColors } from "./Score";
import { CircleDiv } from "./Score.styles";

interface Props {
  circleDiameter: number;
  arguableId: string;
  arguableType: ArguableType;
}

export const ScorePie = ({ circleDiameter, arguableId, arguableType }: Props) => {
  const theme = useTheme();
  const [hovered, setHovered] = useState<number | undefined>(undefined);

  const data: Data = possibleScores.map((score, dataIndex) => {
    const scoreColor = scoreColors[score];
    const paletteColor = theme.palette[scoreColor] as PaletteColor; // not sure how to guarantee this type, since palette has non-PaletteColor keys

    return {
      value: 1,
      color: hovered === dataIndex ? paletteColor.dark : paletteColor.main,
      key: score,
    };
  });

  return (
    <CircleDiv circleDiameter={circleDiameter}>
      <PieChart
        data={data}
        radius={45} // is relative to viewbox size [100, 100]
        label={({ dataEntry }) => dataEntry.key}
        labelStyle={() => ({
          fontSize: "14", // is relative to viewbox size [100, 100]
          pointerEvents: "none",
          userSelect: "none",
        })}
        segmentsStyle={(dataIndex) => ({
          transform: hovered === dataIndex ? "scale(1.1)" : "",
          transformOrigin: "center",
          transition: theme.transitions.create("all", {
            duration: theme.transitions.duration.shortest,
          }),
          pointerEvents: "auto",
          cursor: "pointer",
        })}
        labelPosition={70} // percent of radius
        startAngle={-90 - 360 / possibleScores.length / 2} // shift first slice to top center
        onMouseOver={(_, dataIndex) => setHovered(dataIndex)}
        onMouseOut={(_) => setHovered(undefined)}
        onClick={(_, dataIndex) => setScore(arguableId, arguableType, data[dataIndex].key as Score)}
        background="white"
      />
    </CircleDiv>
  );
};
