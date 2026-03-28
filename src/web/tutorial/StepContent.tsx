import { Close } from "@mui/icons-material";
import { Box, IconButton, Modal, Typography } from "@mui/material";
import { ReactNode, useState } from "react";

import { getLastStartedTrack, getLastStartedTutorial } from "@/web/tutorial/tutorialStore";
import { getStepHeader } from "@/web/tutorial/tutorialUtils";

interface Props {
  stepTitle?: string;
  text: ReactNode;
  imageSlot?: ReactNode;
  imageCaption?: ReactNode;
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
  imageCaption,
  actionSlot,
  // Hardcode height to be consistent for most steps so that nav buttons don't move around as you click through steps.
  // Only use up to 75vh because more than that will overflow the 95vh height of the reactour popover
  // (can't use 100% of parent container because of how we're sizing the image).
  heightClass = "h-[min(75vh,512px)]",
}: Props) => {
  const currentTutorial = getLastStartedTutorial();
  const currentTrack = getLastStartedTrack();
  const header = getStepHeader(currentTutorial, currentTrack);
  const [modalOpen, setModalOpen] = useState(false);
  const tutorialZIndex = 100000;

  return (
    <>
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
          <div
            className="flex min-h-0 grow cursor-zoom-in flex-col items-center justify-center pt-2 [&_>_img]:size-auto [&_>_img]:max-h-full"
            onClick={() => setModalOpen(true)}
          >
            {imageSlot}
            {imageCaption && <Typography variant="caption">{imageCaption}</Typography>}
          </div>
        )}
      </div>
      {imageSlot && (
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          sx={{ zIndex: tutorialZIndex + 1 }}
          className="h-full"
        >
          <Box className="absolute top-1/2 left-1/2 block max-h-[95vh] w-fit max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-paperPlain-main p-0">
            <IconButton
              onClick={() => setModalOpen(false)}
              size="small"
              className="absolute top-3 right-3"
            >
              <Close />
            </IconButton>
            <Typography variant="h5" className="p-4">
              {stepTitle}
            </Typography>
            <Typography variant="body2" className="p-4 pt-0 whitespace-pre-wrap">
              {text}
            </Typography>
            <div className="flex w-full items-center justify-center [&_img]:h-auto [&_img]:max-h-[calc(95vh-12rem)] [&_img]:w-auto [&_img]:max-w-[90vw] [&_img]:object-contain">
              {imageSlot}
            </div>
          </Box>
        </Modal>
      )}
    </>
  );
};
