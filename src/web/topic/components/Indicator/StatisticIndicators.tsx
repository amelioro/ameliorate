import { Stack } from "@mui/material";
import { memo } from "react";

interface Props {
  className?: string;
}

/**
 * Future: e.g. controversial, hot, solid
 */
const StatisticIndicatorsBase = ({ className }: Props) => {
  return <Stack direction="row" margin="2px" spacing="2px" className={className}></Stack>;
};

export const StatisticIndicators = memo(StatisticIndicatorsBase);
