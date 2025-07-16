import { Tooltip as MuiTooltip } from "@mui/material";
import { ReactElement, ReactNode } from "react";

interface Props {
  children: ReactElement;
  /**
   * Typically should have a heading, but if the body conveys the heading well enough, we don't need it.
   *
   * Example where we want this is the IconNode, where we show the whole EditableNode as the body anyway.
   */
  tooltipHeading?: string;
  // TODO?: could make header or body required, but this makes types a bit complicated, particularly in combination with IconWithTooltip
  tooltipBody?: ReactNode;
  immediatelyOpenOnTouch?: boolean;
  tooltipPopperClassName?: string;
}

/**
 * Reasons to use this over MUI Tooltip directly:
 * - rich tooltip styling if `tooltipBody` is provided (styling as described in Material's guidelines https://m3.material.io/components/tooltips/specs#cbda3efe-2f4c-4565-9853-88af60f51e8c)
 *   - mainly uses a heading and a light background
 *   - otherwise sticks with standard non-rich styling
 * - configured by default to be tappable on mobile
 */
export const Tooltip = ({
  children,
  tooltipHeading,
  tooltipBody,
  /**
   * e.g. true for help icon tooltips, but false for node icon where tap actually performs an action
   * (sets the node as summary and selects it) - in these cases, hold-tap-to-open seems fine.
   */
  immediatelyOpenOnTouch = true,
  tooltipPopperClassName,
}: Props) => {
  return (
    <MuiTooltip
      title={
        tooltipBody ? (
          <div className="flex flex-col gap-1">
            {tooltipHeading && <span className="font-bold">{tooltipHeading}</span>}
            {tooltipBody}
          </div>
        ) : (
          tooltipHeading
        )
      }
      enterTouchDelay={immediatelyOpenOnTouch ? 0 : undefined}
      leaveTouchDelay={immediatelyOpenOnTouch ? Infinity : undefined} // touch-away to close on mobile, since message is long
      slotProps={{
        tooltip: {
          className: tooltipBody
            ? "text-black bg-paperShaded-main shadow border rounded-xl text-sm font-normal"
            : "",
        },
        popper: {
          className: tooltipPopperClassName,
        },
      }}
    >
      {children}
    </MuiTooltip>
  );
};
