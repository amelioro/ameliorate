import { AccountTree, AccountTreeOutlined } from "@mui/icons-material";
import { MouseEventHandler, useCallback } from "react";

import { useSessionUser } from "../../../common/hooks";
import { useExplicitClaimCount, useNonTopLevelClaimCount } from "../../store/graphPartHooks";
import { useUserCanEditTopicData } from "../../store/userHooks";
import { viewOrCreateClaimTree } from "../../store/viewActions";
import { Indicator } from "./Indicator";

interface Props {
  graphPartId: string;
}

export const ClaimTreeIndicator = ({ graphPartId }: Props) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);
  const explicitClaimCount = useExplicitClaimCount(graphPartId);
  const nonTopLevelClaimCount = useNonTopLevelClaimCount(graphPartId);

  const onClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      // prevent setting the node as selected because we're about to navigate away from this diagram
      event.stopPropagation();
      viewOrCreateClaimTree(graphPartId);
    },
    [graphPartId]
  );

  const Icon = nonTopLevelClaimCount > 0 ? AccountTree : AccountTreeOutlined;
  const title =
    "View claim tree" +
    (nonTopLevelClaimCount > 0 ? ` (${nonTopLevelClaimCount} claims not shown here)` : "");

  return (
    <Indicator
      Icon={Icon}
      iconHasBackground={false}
      title={title}
      // Kind-of-hack to prevent viewing empty claim tree without edit access if there are no claims
      // because it'll try to create the root claim in the db, and give an authorize error
      onClick={userCanEditTopicData || explicitClaimCount > 0 ? onClick : undefined}
    />
  );
};
