import { Button } from "@mui/material";
import { MouseEventHandler } from "react";

import { type MuiIcon, indicatorLengthRem } from "@/web/topic/utils/nodeDecoration";

export interface IndicatorProps {
  Icon: MuiIcon;
  title: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  bgColor?: string;
  filled?: boolean;
  className?: string;
}

export const Indicator = ({
  Icon,
  title,
  onClick,
  bgColor = "white",
  filled = false,
  className,
}: IndicatorProps) => {
  const onClickHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      // In most cases, we don't want the click to result in selecting the parent node.
      // If we want that to happen, we can call `setSelected` manually in that indicator's specific onClick.
      event.stopPropagation();
      onClick(event);
    }
  };
  const calculatedBgColor = filled ? `color-mix(in oklch, ${bgColor}, #000 10%)` : bgColor;

  return (
    <>
      <Button
        title={title}
        aria-label={title}
        variant="contained"
        onClick={onClickHandler}
        className={
          // text-base seems to fit more snuggly than the default 14px
          "border border-solid border-gray-400 text-base shadow-none" +
          (!onClick ? " pointer-events-none" : "") +
          (className ? ` ${className}` : "")
        }
        sx={{
          backgroundColor: calculatedBgColor,
          width: `${indicatorLengthRem}rem`,
          minWidth: `${indicatorLengthRem}rem`,
          height: `${indicatorLengthRem}rem`,
          padding: "0px",

          "&:hover": {
            backgroundColor: `color-mix(in oklch, ${calculatedBgColor}, #000 10%)`,
          },
        }}
      >
        <Icon fontSize="inherit" />
      </Button>
    </>
  );
};
