import { Typography } from "@mui/material";
import { ReactNode } from "react";

import { getLastStartedTrack, getLastStartedTutorial } from "@/web/tutorial/tutorialStore";
import { getStepHeader } from "@/web/tutorial/tutorialUtils";

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
  // Hardcode height to be consistent for most steps so that nav buttons don't move around as you click through steps.
  // Only use up to 75vh because more than that will overflow the 95vh height of the reactour popover
  // (can't use 100% of parent container because of how we're sizing the image).
  heightClass = "h-[min(75vh,512px)]",
}: Props) => {
  const currentTutorial = getLastStartedTutorial();
  const currentTrack = getLastStartedTrack();
  const header = getStepHeader(currentTutorial, currentTrack);

  return (
    <div className={`${heightClass} flex flex-col gap-2`}>
      {header && (
        <Typography variant="body2" className="opacity-50">
          {" "}
          {header}{" "}
        </Typography>
      )}
      <Typography variant="h5">{stepTitle}</Typography>
      <Typography variant="body2" className="whitespace-pre-wrap">
        {text}
      </Typography>
      {actionSlot && <div className="flex pt-2">{actionSlot}</div>}
      {imageSlot && ( // allow image to grow to fill height & width space while maintaining aspect ratio
        <div className="flex min-h-0 grow flex-col items-center justify-center pt-2 [&_>_img]:size-auto [&_>_img]:max-h-full">
          {imageSlot}
        </div>
      )}
    </div>
  );
};
