import { Article, ArticleOutlined } from "@mui/icons-material";

import { viewOrCreateClaimDiagram } from "../../store/actions";
import { useExplicitClaimCount } from "../../store/scorableHooks";
import { ScorableType } from "../../utils/diagram";
import { Indicator } from "../Indicator/Indicator";

interface Props {
  scorableId: string;
  scorableType: ScorableType;
}

export const ClaimIndicator = ({ scorableId, scorableType }: Props) => {
  const explicitClaimCount = useExplicitClaimCount(scorableId, scorableType);

  const Icon = explicitClaimCount > 0 ? Article : ArticleOutlined;

  return (
    <Indicator Icon={Icon} onClick={() => viewOrCreateClaimDiagram(scorableId, scorableType)} />
  );
};
