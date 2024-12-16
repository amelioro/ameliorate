import { Notes } from "@mui/icons-material";
import { useCallback } from "react";

import { emitter } from "@/web/common/event";
import { Indicator } from "@/web/topic/components/Indicator/Indicator";
import { setSelected } from "@/web/view/currentViewStore/store";

interface Props {
  graphPartId: string;
  notes: string;
}

export const DetailsIndicator = ({ graphPartId, notes }: Props) => {
  const hasDetails = notes.length > 0;

  const onClick = useCallback(() => {
    setSelected(graphPartId);
    emitter.emit("viewBasics");
  }, [graphPartId]);

  return <Indicator Icon={Notes} title={"View details"} onClick={onClick} filled={hasDetails} />;
};
