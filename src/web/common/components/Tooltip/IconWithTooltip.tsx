import { ReactNode } from "react";

import { Tooltip } from "@/web/common/components/Tooltip/Tooltip";

interface WithHeading {
  tooltipHeading: string;
  ariaLabel?: never;
}

interface WithAriaLabel {
  tooltipHeading?: never;
  ariaLabel: string;
}

// only use one or the other because the heading makes sense to be used for the aria-label if it's passed
type WithHeadingOrAriaLabel = WithHeading | WithAriaLabel;

type Props = {
  tooltipBody?: ReactNode;
  tooltipPopperClassName?: string;
  iconButtonClassName?: string;
  icon: ReactNode;
} & WithHeadingOrAriaLabel;

/**
 * Mainly adds a button wrapper around the icon so that the icon can be focused via tabbing or clicking
 * and the tooltip will show.
 *
 * It does seem a little awkward/unexpected that "IconWithTooltip" actually adds a button wrapper
 * around the icon, but it does seem to make the tooltip easier to get to via keyboard.
 *
 * - chose not to merely set tab-index="0" on the icon because that doesn't make it clickable by vimium
 * - chose not to use a MUI button because that triggers hover/click bg color changes that don't really make sense for an icon
 */
export const IconWithTooltip = ({
  tooltipHeading,
  tooltipBody,
  ariaLabel,
  tooltipPopperClassName,
  iconButtonClassName,
  icon,
}: Props) => {
  return (
    <Tooltip
      tooltipHeading={tooltipHeading}
      tooltipBody={tooltipBody}
      tooltipPopperClassName={tooltipPopperClassName}
    >
      <button
        aria-label={tooltipHeading ?? ariaLabel}
        // Don't make it look like clicking will do something, since it won't.
        // Using a button here is an attempt to make it accessible, since the tooltip will show
        // on focus.
        className={
          "flex cursor-default p-0" + (iconButtonClassName ? ` ${iconButtonClassName}` : "")
        }
      >
        {icon}
      </button>
    </Tooltip>
  );
};
