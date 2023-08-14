import Tooltip from "@mui/material/Tooltip";
import { MouseEventHandler } from "react";

import { MuiIcon } from "../../utils/node";
import { StyledButton } from "./Indicator.styles";

interface IndicatorProps {
  Icon: MuiIcon;
  title: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export const Indicator = ({ Icon, title, onClick }: IndicatorProps) => {
  return (
    // black outline looks a bit weird on the table icon, not sure how to easily fix though
    // also hover color diff for black is impossible to see, so a custom hover is added to darken the gray instead
    // see permalink for a few attempted variations in comments https://github.com/amelioro/ameliorate/blob/a6001b43b30a57b47acc67ce4065c4122d7929a8/web/src/modules/topic/components/Indicator/Indicator.tsx#L28-L54
    <Tooltip title={title}>
      <StyledButton
        variant="contained"
        color="neutralContrast"
        onClick={onClick}
        sx={!onClick ? { pointerEvents: "none" } : {}}
      >
        <Icon color="neutral" />
      </StyledButton>
    </Tooltip>
  );
};
