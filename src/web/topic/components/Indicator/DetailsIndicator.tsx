import { Article, ArticleOutlined } from "@mui/icons-material";
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
  const Icon = hasDetails ? Article : ArticleOutlined;

  const onClick = useCallback(() => {
    setSelected(graphPartId);
    emitter.emit("viewTopicDetails");
  }, [graphPartId]);

  return <Indicator Icon={Icon} title={"View details"} onClick={onClick} />;
};
