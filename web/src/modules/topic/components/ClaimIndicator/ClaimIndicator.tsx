import { Article, ArticleOutlined } from "@mui/icons-material";

import { viewOrCreateClaimDiagram } from "../../store/actions";
import { useDiagram } from "../../store/store";
import { getClaimDiagramId } from "../../utils/claim";
import { ScorableType } from "../../utils/diagram";
import { Indicator } from "../Indicator/Indicator";

interface Props {
  scorableId: string;
  scorableType: ScorableType;
}

export const ClaimIndicator = ({ scorableId, scorableType }: Props) => {
  const claimDiagramId = getClaimDiagramId(scorableId, scorableType);
  const diagram = useDiagram(claimDiagramId);

  // consider setting noUncheckedIndexedAccess because this _can_ be undefined
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const hasClaims = diagram?.nodes.length > 1;

  const Icon = hasClaims ? Article : ArticleOutlined;

  return (
    <Indicator Icon={Icon} onClick={() => viewOrCreateClaimDiagram(scorableId, scorableType)} />
  );
};
