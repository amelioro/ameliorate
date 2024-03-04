import { Article, ArticleOutlined } from "@mui/icons-material";
import { useCallback } from "react";

import { setSelected } from "../../../view/navigateStore";
import { useExplicitClaimCount, useResearchNodes } from "../../store/graphPartHooks";
import { GraphPart } from "../../utils/graph";
import { viewDetails } from "../TopicPane/TopicPane";
import { Indicator } from "./Indicator";

interface Props {
  graphPart: GraphPart;
}

export const DetailsIndicator = ({ graphPart }: Props) => {
  const explicitClaimCount = useExplicitClaimCount(graphPart.id);
  const { facts, sources } = useResearchNodes(graphPart.id);

  const hasNotes = graphPart.data.notes.length > 0;
  const hasClaims = explicitClaimCount > 0; // TODO: add separate indicator for claims
  const hasResearchNodes = [...facts, ...sources].length > 0; // excluding questions because that has its own indicator
  const hasDetails = hasNotes || hasClaims || hasResearchNodes;
  const Icon = hasDetails ? Article : ArticleOutlined;

  const onClick = useCallback(() => {
    setSelected(graphPart.id);
    viewDetails();
  }, [graphPart.id]);

  return <Indicator Icon={Icon} title={"View details"} onClick={onClick} />;
};
