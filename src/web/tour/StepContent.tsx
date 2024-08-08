import { Typography } from "@mui/material";
import { ReactNode } from "react";

interface Props {
  stepTitle?: string;
  text: ReactNode;
  imageSlot?: ReactNode;
  actionSlot?: ReactNode;
  /**
   * Ideally we'd align the popover to the bottom of page, so that height can change without moving the nav buttons,
   * but reactour does not properly re-locate the popover when its size changes.
   * So we're hardcoding the height.
   */
  heightClass?: string;
}

export const StepContent = ({
  stepTitle,
  text,
  imageSlot,
  actionSlot,
  heightClass = "h-[428px]",
}: Props) => {
  return (
    <div className={`${heightClass} flex flex-col gap-2`}>
      <Typography variant="h5">{stepTitle}</Typography>
      <Typography variant="body2" className="whitespace-pre-wrap">
        {text}
      </Typography>
      {/* why does differing content sizes result in popover not aligning to bottom of page? */}
      {imageSlot && (
        // allow image to grow to fill height & width space while maintaining aspect ratio
        <div className="flex min-h-0 flex-1 items-center justify-center *:max-h-full *:max-w-full *:object-contain">
          {imageSlot}
        </div>
      )}
      {actionSlot && <div className="flex pt-2">{actionSlot}</div>}
    </div>
  );
};
