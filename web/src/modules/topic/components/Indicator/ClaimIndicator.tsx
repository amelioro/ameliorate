import { Article, ArticleOutlined } from "@mui/icons-material";
import Tooltip from "@mui/material/Tooltip";

import { useExplicitClaimCount } from "../../store/arguableHooks";
import { viewOrCreateClaimDiagram } from "../../store/viewActions";
import { ArguableType } from "../../utils/diagram";
import { Indicator } from "./Indicator";

interface Props {
  arguableId: string;
  arguableType: ArguableType; // rename to ArguableType
}

export const ClaimIndicator = ({ arguableId, arguableType }: Props) => {
  const explicitClaimCount = useExplicitClaimCount(arguableId, arguableType);

  const Icon = explicitClaimCount > 0 ? Article : ArticleOutlined;

  return (

    <Tooltip title="View claims">

    <Indicator  Icon={Icon} onClick={(event) => {
        // prevent setting the node as selected because we're about to navigate away from this diagram
        event.stopPropagation();
        viewOrCreateClaimDiagram(arguableId, arguableType);
      }}  />
        
    </Tooltip>

   
  );
};
