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
  filled?: boolean;
}

export const Indicator = ({
  Icon,
  title,
  onClick,
  iconHasBackground = true,
  color = "neutral",
  filled = true,
}: IndicatorProps) => {
  const onClickHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      // In most cases, we don't want the click to result in selecting the parent node.
      // If we want that to happen, we can call `setSelected` manually in that indicator's specific onClick.
      event.stopPropagation();
      onClick(event);
    }
  };

  return (
    <>
      {iconHasBackground ? (
        <StyledButton
          title={title}
          aria-label={title}
          variant="contained"
          color="neutralContrast"
          onClick={onClickHandler}
          // hover color for black button is impossible to see, so a custom hover is added to the svg instead of the button
          className={`[&_>_svg]:hover:text-neutral-dark ${!onClick ? "pointer-events-none" : ""}`}
        >
          <Icon color={filled ? color : "paper"} />
        </StyledButton>
      ) : (
        <StyledButton
          title={title}
          aria-label={title}
          variant="contained"
          color={filled ? color : "paper"}
          onClick={onClickHandler}
          // text-base seems to fit more snuggly than the default 14px
          className={`border border-solid text-base ${!onClick ? "pointer-events-none" : ""}`}
        >
          <Icon color="neutralContrast" fontSize="inherit" />
        </StyledButton>
      )}
    </>
  );
};
