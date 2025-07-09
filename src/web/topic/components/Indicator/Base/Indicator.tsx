import { type ButtonProps } from "@mui/material";
import { MouseEventHandler } from "react";

import { StyledButton } from "@/web/topic/components/Indicator/Base/Indicator.styles";
import { MuiIcon } from "@/web/topic/utils/node";
import { useFillNodesWithColor } from "@/web/view/userConfigStore";

export interface IndicatorProps {
  Icon: MuiIcon;
  title: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  color?: ButtonProps["color"];
  filled?: boolean;
  className?: string;
}

export const Indicator = ({
  Icon,
  title,
  onClick,
  color = "neutral",
  filled = true,
  className,
}: IndicatorProps) => {
  const nodesFilled = useFillNodesWithColor();

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
        color={filled ? color : "paperPlain"}
        onClick={onClickHandler}
        className={
          // text-base seems to fit more snuggly than the default 14px
          "border border-solid text-base shadow-none" +
          (nodesFilled ? " border-gray-500" : " border-neutral-main") +
          (!onClick ? " pointer-events-none" : "") +
          (className ? ` ${className}` : "")
        }
      >
        <Icon color="neutralContrast" fontSize="inherit" />
      </StyledButton>
    </>
  );
};
