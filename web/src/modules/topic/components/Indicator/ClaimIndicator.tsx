import { Article, ArticleOutlined } from "@mui/icons-material";

import { viewOrCreateClaimDiagram } from "../../store/actions";
import { useExplicitClaimCount } from "../../store/arguableHooks";
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
    <Indicator Icon={Icon} onClick={() => viewOrCreateClaimDiagram(arguableId, arguableType)} />
  );
};
