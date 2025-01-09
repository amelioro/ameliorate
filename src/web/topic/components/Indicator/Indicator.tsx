import { type ButtonProps } from "@mui/material";
import { MouseEventHandler } from "react";

import { StyledButton } from "@/web/topic/components/Indicator/Indicator.styles";
import { MuiIcon } from "@/web/topic/utils/node";
import { useShowIndicators } from "@/web/view/userConfigStore";

interface IndicatorProps {
  Icon: MuiIcon;
  title: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  color?: ButtonProps["color"];
  filled?: boolean;
  /**
   * true if this indicator is for a node or edge; example of false is JustificationTreeIndicator
   */
  graphPartIndicator?: boolean;
}

export const Indicator = ({
  Icon,
  title,
  onClick,
  color = "neutral",
  filled = true,
  graphPartIndicator = true,
}: IndicatorProps) => {
  const showIndicators = useShowIndicators();

  const onClickHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      // In most cases, we don't want the click to result in selecting the parent node.
      // If we want that to happen, we can call `setSelected` manually in that indicator's specific onClick.
      event.stopPropagation();
      onClick(event);
    }
  };

  // no need to hide indicators that aren't for graph parts e.g. JustificationTreeIndicator
  const showIndicator = showIndicators || !graphPartIndicator;

  return (
    <>
      <StyledButton
        title={title}
        aria-label={title}
        variant="contained"
        color={filled ? color : "paperPlain"}
        onClick={onClickHandler}
        className={
          // text-base seems to fit more snuggly than the default 14px
          "border border-solid border-neutral-main text-base shadow-none" +
          (!onClick ? " pointer-events-none" : "") +
          (showIndicator ? "" : " hidden")
        }
      >
        <Icon color="neutralContrast" fontSize="inherit" />
      </StyledButton>
    </>
  );
};
