import { type ButtonProps } from "@mui/material";
import { MouseEventHandler } from "react";

import { StyledButton } from "@/web/topic/components/Indicator/Indicator.styles";
import { MuiIcon } from "@/web/topic/utils/node";

interface IndicatorProps {
  Icon: MuiIcon;
  title: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  color?: ButtonProps["color"];
  filled?: boolean;
}

export const Indicator = ({
  Icon,
  title,
  onClick,
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
    </>
  );
};
