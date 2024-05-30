import { useTheme } from "@emotion/react";
import { Tooltip } from "@mui/material";
import { useState } from "react";
import { PieChart as ReactMinimalPieChart } from "react-minimal-pie-chart";
import { BaseDataEntry, Data } from "react-minimal-pie-chart/types/commonTypes";

import { errorWithData } from "@/common/errorHandling";

export interface CustomDataEntry extends BaseDataEntry {
  hoverColor: string;
}

interface PieProps {
  onClick?: (segmentData: BaseDataEntry) => void;
  customData: Data<CustomDataEntry>;
  startAngle: number;
  type?: "regular" | "button";
}

/**
 * Pie will take up the size of its parent
 */
export const PieChart = ({ onClick, customData, startAngle, type = "regular" }: PieProps) => {
  const theme = useTheme();
  const [hovered, setHovered] = useState<number | undefined>(undefined);

  const data: Data = customData.map((customDataEntry, dataIndex) => {
    const shouldUseHoverColor = type === "regular" ? hovered === dataIndex : hovered !== undefined;

    return {
      key: customDataEntry.key,
      value: customDataEntry.value,
      color: shouldUseHoverColor ? customDataEntry.hoverColor : customDataEntry.color,
    };
  });

  const tooltipText = hovered !== undefined ? customData[hovered]?.title?.toString() : undefined;

  return (
    // When going from hovered to not-hovered, there's a frame where tooltip renders without text. Not sure how to fix this.
    <Tooltip
      title={tooltipText ? <div style={{ whiteSpace: "pre-line" }}>{tooltipText}</div> : ""}
      followCursor
      open={tooltipText !== undefined} // so that it opens on click for mobile
    >
      {/* Wrapper so that we can use a tooltip, since pie chart doesn't forward ref & props */}
      <div>
        <ReactMinimalPieChart
          data={data}
          // Radius is relative to viewbox size [100, 100]; so 50 means diameter 100 means take up the whole svg space.
          // Radius should be 45 if we want to scale(1.1) so that there's space within the svg to scale
          // Radius should be 50 if we don't need to scale, and want the pie to take the whole svg space
          radius={type === "regular" ? 45 : 50}
          label={({ dataEntry }) => (type === "regular" ? dataEntry.key : undefined)}
          labelStyle={() => ({
            fontSize: "14", // is relative to viewbox size [100, 100]
            pointerEvents: "none",
            userSelect: "none",
          })}
          segmentsStyle={(dataIndex) => ({
            transform: type === "regular" && hovered === dataIndex ? "scale(1.1)" : "",
            transformOrigin: "center",
            transition: theme.transitions.create("all", {
              duration: theme.transitions.duration.shortest,
            }),
            pointerEvents: "auto",
            cursor: onClick ?? type === "button" ? "pointer" : "auto",
          })}
          labelPosition={70} // percent of radius
          startAngle={startAngle}
          onMouseOver={(_, dataIndex) => setHovered(dataIndex)}
          onMouseOut={(_) => setHovered(undefined)}
          onClick={(_, dataIndex) => {
            if (!onClick) return;

            const segmentData = data[dataIndex];
            if (!segmentData)
              throw errorWithData(`invalid pie segment dataIndex ${dataIndex}`, data);

            onClick(segmentData);
          }}
          background="white"
        />
      </div>
    </Tooltip>
  );
};
