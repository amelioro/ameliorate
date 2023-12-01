import { Article, ArticleOutlined } from "@mui/icons-material";

import { setSelectedGraphPart } from "../../store/actions";
import { GraphPart } from "../../utils/graph";
import { viewDetails } from "../Surface/TopicPane";
import { Indicator } from "./Indicator";

interface Props {
  graphPart: GraphPart;
}

export const DetailsIndicator = ({ graphPart }: Props) => {
  const Icon = graphPart.data.notes.length > 0 ? Article : ArticleOutlined;

  return (
    <Indicator
      Icon={Icon}
      title={"View details"}
      onClick={() => {
        setSelectedGraphPart(graphPart.id);
        viewDetails();
      }}
    />
  );
};
