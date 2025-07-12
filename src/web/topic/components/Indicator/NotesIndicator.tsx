import { Notes } from "@mui/icons-material";
import { useCallback } from "react";

import { emitter } from "@/web/common/event";
import { ContentIndicator } from "@/web/topic/components/Indicator/Base/ContentIndicator";
import { setSelected } from "@/web/view/selectedPartStore";

interface Props {
  graphPartId: string;
  notes: string;
  bgColor: string;
}

export const NotesIndicator = ({ graphPartId, notes, bgColor }: Props) => {
  const hasNotes = notes.length > 0;

  const onClick = useCallback(() => {
    setSelected(graphPartId);
    emitter.emit("viewBasics");
  }, [graphPartId]);

  if (!hasNotes) return <></>;

  return <ContentIndicator Icon={Notes} title={"View notes"} onClick={onClick} bgColor={bgColor} />;
};
