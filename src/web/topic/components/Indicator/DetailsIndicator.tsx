import { Article, ArticleOutlined } from "@mui/icons-material";
import { useCallback } from "react";

import { setSelected } from "../../../view/navigateStore";
import { viewDetails } from "../TopicPane/paneStore";
import { Indicator } from "./Indicator";

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
