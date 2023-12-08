import { Article, ArticleOutlined } from "@mui/icons-material";

import { setSelected } from "../../../view/navigateStore";
import { useExplicitClaimCount, useExploreNodes } from "../../store/graphPartHooks";
import { GraphPart } from "../../utils/graph";
import { viewDetails } from "../Surface/TopicPane";
import { Indicator } from "./Indicator";

interface Props {
  graphPart: GraphPart;
}

export const DetailsIndicator = ({ graphPart }: Props) => {
  const explicitClaimCount = useExplicitClaimCount(graphPart.id);
  const { facts, sources } = useExploreNodes(graphPart.id);

  const hasNotes = graphPart.data.notes.length > 0;
  const hasClaims = explicitClaimCount > 0; // TODO: add separate indicator for claims
  const hasExploreNodes = [...facts, ...sources].length > 0; // excluding questions because that has its own indicator
  const hasDetails = hasNotes || hasClaims || hasExploreNodes;
  const Icon = hasDetails ? Article : ArticleOutlined;

  return (
    <Indicator
      Icon={Icon}
      title={"View details"}
      onClick={() => {
        setSelected(graphPart.id);
        viewDetails();
      }}
    />
  );
};
