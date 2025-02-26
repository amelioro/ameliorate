import { Notes } from "@mui/icons-material";
import { ButtonProps } from "@mui/material";
import { useCallback } from "react";

import { emitter } from "@/web/common/event";
import { Indicator } from "@/web/topic/components/Indicator/Base/Indicator";
import { setSelected } from "@/web/view/selectedPartStore";

interface Props {
  graphPartId: string;
  notes: string;
  partColor: ButtonProps["color"];
}

export const NotesIndicator = ({ graphPartId, notes, partColor }: Props) => {
  const hasNotes = notes.length > 0;

  const onClick = useCallback(() => {
    setSelected(graphPartId);
    emitter.emit("viewBasics");
  }, [graphPartId]);

  if (!hasNotes) return <></>;

  return <Indicator Icon={Notes} title={"View notes"} onClick={onClick} color={partColor} />;
};
