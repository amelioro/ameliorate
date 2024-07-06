import { type ButtonProps } from "@mui/material";
import { MouseEventHandler } from "react";

import { StyledButton } from "@/web/topic/components/Indicator/Indicator.styles";
import { MuiIcon } from "@/web/topic/utils/node";

interface IndicatorProps {
  Icon: MuiIcon;
  title: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /**
   * Determines where colors are applied, because otherwise color and hover feel inconsistent.
   *
   * If the icon has a background, then it will be colored and have hover effect.
   * If the icon doesn't have a background, then the button will be colored and have hover effect.
   */
  iconHasBackground?: boolean;
  color?: ButtonProps["color"];
}

export const Indicator = ({
  Icon,
  title,
  onClick,
  iconHasBackground = true,
  color = "neutral",
}: IndicatorProps) => {
  return (
    // black outline looks a bit weird on the table icon, not sure how to easily fix though
    // also hover color diff for black is impossible to see, so a custom hover is added to darken the gray instead
    // see permalink for a few attempted variations in comments https://github.com/amelioro/ameliorate/blob/a6001b43b30a57b47acc67ce4065c4122d7929a8/web/src/modules/topic/components/Indicator/Indicator.tsx#L28-L54
    <>
      {iconHasBackground ? (
        <StyledButton
          title={title}
          aria-label={title}
          variant="contained"
          color="neutralContrast"
          onClick={onClick}
          sx={{
            pointerEvents: !onClick ? "none" : undefined,
            "&:hover > svg": {
              color: (theme) => theme.palette.neutral.dark,
            },
          }}
        >
          <Icon color={color} />
        </StyledButton>
      ) : (
        <StyledButton
          title={title}
          aria-label={title}
          variant="contained"
          color={color}
          onClick={onClick}
          sx={{
            border: "1px solid",
            pointerEvents: !onClick ? "none" : undefined,
            fontSize: "16px", // default seems to be 14px, but 16px fits more snuggly within button size
          }}
        >
          <Icon color="neutralContrast" fontSize="inherit" />
        </StyledButton>
      )}
    </>
  );
};
