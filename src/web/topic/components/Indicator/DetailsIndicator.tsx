import { Article, ArticleOutlined } from "@mui/icons-material";
import { useCallback } from "react";

import { Indicator } from "@/web/topic/components/Indicator/Indicator";
import { viewDetails } from "@/web/topic/components/TopicPane/paneStore";
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
    viewDetails();
  }, [graphPartId]);

  return <Indicator Icon={Icon} title={"View details"} onClick={onClick} />;
};
