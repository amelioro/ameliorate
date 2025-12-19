import { Tooltip as MuiTooltip, TooltipProps } from "@mui/material";
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
  placement?: TooltipProps["placement"];
  /**
   * Kind of jank but specifically for buttons with tooltips, if the button opens a menu, it can be
   * annoying to have the tooltip flicker open for only a moment before closing when the menu opens.
   * (e.g. add node button group when using a menu)
   */
  childrenOpensAMenu?: boolean;
  immediatelyOpenOnTouch?: boolean;
  /**
   * This is a hack to avoid the tooltip flickering at position (0,0) when the child element is hidden via CSS.
   *
   * This is accomplished by skipping the tooltip's exit transition.
   *
   * Unfortunately a warning will still be thrown, but maybe upgrading Mui will fix this (new versions
   * use floating-ui for tooltips rather than popperjs)...
   *
   * To reproduce the issue:
   * 1. hover a node
   * 2. hover one of the node's add buttons to display this tooltip
   * 3. mouse away from the node and add button
   * 4. observe Mui warning "The `anchorEl` prop provided to the component is invalid."
   */
  childrenHideViaCss?: boolean;
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
  placement,
  childrenOpensAMenu = false,
  /**
   * e.g. true for help icon tooltips, but false for node icon where tap actually performs an action
   * (sets the node as summary and selects it) - in these cases, hold-tap-to-open seems fine.
   */
  immediatelyOpenOnTouch = true,
  childrenHideViaCss = false,
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
      placement={placement}
      slotProps={{
        transition: { exit: !childrenHideViaCss },
        tooltip: {
          className: tooltipBody
            ? "text-black bg-paperShaded-main shadow-sm border rounded-xl text-sm font-normal"
            : "",
        },
        popper: {
          className: tooltipPopperClassName,
        },
      }}
      enterDelay={childrenOpensAMenu ? 500 : undefined}
      enterTouchDelay={immediatelyOpenOnTouch ? 0 : undefined}
      leaveTouchDelay={immediatelyOpenOnTouch ? Infinity : undefined} // touch-away to close on mobile, since message is long
    >
      {children}
    </MuiTooltip>
  );
};
