import { Typography } from "@mui/material";
import { ReactNode } from "react";

interface Props {
  stepTitle?: string;
  text: ReactNode;
  imageSlot?: ReactNode;
  actionSlot?: ReactNode;
  className?: string;
}

export const StepContent = ({ stepTitle, text, imageSlot, actionSlot }: Props) => {
  return (
    <div className="flex flex-col gap-2">
      <Typography variant="h5">{stepTitle}</Typography>
      <Typography variant="body2" className="whitespace-pre-wrap">
        {text}
      </Typography>
      {/* why does differing content sizes result in popover not aligning to bottom of page? */}
      {imageSlot && <div className="flex items-center justify-center">{imageSlot}</div>}
      {actionSlot && <div className="flex pt-2">{actionSlot}</div>}
    </div>
  );
};
