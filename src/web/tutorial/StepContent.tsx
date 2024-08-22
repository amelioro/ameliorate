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
      {actionSlot && <div className="flex pt-2">{actionSlot}</div>}
      {imageSlot && (
        // allow image to grow to fill height & width space while maintaining aspect ratio
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center pt-2 [&_>_img]:max-h-full [&_>_img]:max-w-full [&_>_img]:object-contain">
          {imageSlot}
        </div>
      )}
    </div>
  );
};
