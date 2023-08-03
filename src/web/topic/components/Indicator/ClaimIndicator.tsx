import { Article, ArticleOutlined } from "@mui/icons-material";

import { useExplicitClaimCount } from "../../store/arguableHooks";
import { viewOrCreateClaimDiagram } from "../../store/viewActions";
import { ArguableType } from "../../utils/diagram";
import { Indicator } from "./Indicator";

interface Props {
  arguableId: string;
  arguableType: ArguableType; // rename to ArguableType
}

export const ClaimIndicator = ({ arguableId, arguableType }: Props) => {
  const explicitClaimCount = useExplicitClaimCount(arguableId);

  const Icon = explicitClaimCount > 0 ? Article : ArticleOutlined;

  return (
    <Indicator
      Icon={Icon}
      title={"View claims"}
      onClick={(event) => {
        // prevent setting the node as selected because we're about to navigate away from this diagram
        event.stopPropagation();
        viewOrCreateClaimDiagram(arguableId, arguableType);
      }}
    />
  );
};
