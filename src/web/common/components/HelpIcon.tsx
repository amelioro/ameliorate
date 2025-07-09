import { HelpOutline } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { ReactNode } from "react";

interface Props {
  tooltipHeading: string;
  tooltipBody: ReactNode;
  iconClassName?: string;
}

/**
 * Help Icons usually have a decent amount of text, so we style them as a Rich tooltip, as described
 * in Material's guidelines https://m3.material.io/components/tooltips/specs#cbda3efe-2f4c-4565-9853-88af60f51e8c.
 *
 * Notably, with a heading and light background.
 */
export const HelpIcon = ({ tooltipHeading, tooltipBody, iconClassName }: Props) => {
  return (
    <Tooltip
      title={
        <div className="flex flex-col gap-1">
          <span className="font-bold">{tooltipHeading}</span>
          {tooltipBody}
        </div>
      }
      enterTouchDelay={0} // allow touch to immediately trigger
      leaveTouchDelay={Infinity} // touch-away to close on mobile, since message is long
      slotProps={{
        tooltip: {
          className: "text-black bg-paperShaded-main shadow border rounded-xl text-sm font-normal",
        },
      }}
    >
      <IconButton
        aria-label={tooltipHeading}
        // Don't make it look like clicking will do something, since it won't.
        // Using a button here is an attempt to make it accessible, since the tooltip will show
        // on focus.
        className={"cursor-default self-center p-0" + (iconClassName ? ` ${iconClassName}` : "")}
      >
        <HelpOutline fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};
