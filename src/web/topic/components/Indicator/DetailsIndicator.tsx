import { Article, ArticleOutlined } from "@mui/icons-material";

import { setSelectedGraphPart } from "../../store/actions";
import { useExplicitClaimCount } from "../../store/graphPartHooks";
import { GraphPart } from "../../utils/graph";
import { viewDetails } from "../Surface/TopicPane";
import { Indicator } from "./Indicator";

interface Props {
  graphPart: GraphPart;
}

export const DetailsIndicator = ({ graphPart }: Props) => {
  const explicitClaimCount = useExplicitClaimCount(graphPart.id);

  const hasNotes = graphPart.data.notes.length > 0;
  const hasClaims = explicitClaimCount > 0; // TODO: add separate indicator for claims
  const hasDetails = hasNotes || hasClaims;
  const Icon = hasDetails ? Article : ArticleOutlined;

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
