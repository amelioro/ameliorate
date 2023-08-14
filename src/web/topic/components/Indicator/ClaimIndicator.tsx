import { Article, ArticleOutlined } from "@mui/icons-material";

import { useSessionUser } from "../../../common/hooks";
import { useExplicitClaimCount } from "../../store/arguableHooks";
import { useUserCanEditTopicData } from "../../store/userHooks";
import { viewOrCreateClaimTree } from "../../store/viewActions";
import { ArguableType } from "../../utils/diagram";
import { Indicator } from "./Indicator";

interface Props {
  arguableId: string;
  arguableType: ArguableType; // rename to ArguableType
}

export const ClaimIndicator = ({ arguableId, arguableType }: Props) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.id);
  const explicitClaimCount = useExplicitClaimCount(arguableId);

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
              viewOrCreateClaimTree(arguableId, arguableType);
            }
          : undefined
      }
    />
  );
};
