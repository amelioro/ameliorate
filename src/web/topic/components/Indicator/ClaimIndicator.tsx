import { Article, ArticleOutlined } from "@mui/icons-material";

import { useSessionUser } from "../../../common/hooks";
import { useExplicitClaimCount } from "../../store/graphPartHooks";
import { useUserCanEditTopicData } from "../../store/userHooks";
import { viewOrCreateClaimTree } from "../../store/viewActions";
import { GraphPartType } from "../../utils/diagram";
import { Indicator } from "./Indicator";

interface Props {
  graphPartId: string;
  graphPartType: GraphPartType;
}

export const ClaimIndicator = ({ graphPartId, graphPartType }: Props) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.id);
  const explicitClaimCount = useExplicitClaimCount(graphPartId);

  const Icon = explicitClaimCount > 0 ? Article : ArticleOutlined;

  return (
    <Indicator
      Icon={Icon}
      title={"View claims"}
      // Kind-of-hack to prevent viewing empty claim tree without edit access if there are no claims
      // because it'll try to create the root claim in the db, and give an authorize error
      onClick={
        userCanEditTopicData || explicitClaimCount > 0
          ? (event) => {
              // prevent setting the node as selected because we're about to navigate away from this diagram
              event.stopPropagation();
              viewOrCreateClaimTree(graphPartId, graphPartType);
            }
          : undefined
      }
    />
  );
};
