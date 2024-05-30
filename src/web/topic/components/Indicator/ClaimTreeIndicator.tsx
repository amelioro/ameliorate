import { AccountTree, AccountTreeOutlined } from "@mui/icons-material";
import { MouseEventHandler, useCallback } from "react";

import { Indicator } from "@/web/topic/components/Indicator/Indicator";
import {
  useExplicitClaimCount,
  useNonTopLevelClaimCount,
  useRootClaim,
} from "@/web/topic/store/graphPartHooks";
import { viewJustification } from "@/web/view/currentViewStore/filter";

interface Props {
  graphPartId: string;
}

export const ClaimTreeIndicator = ({ graphPartId }: Props) => {
  const rootClaim = useRootClaim(graphPartId);
  const explicitClaimCount = useExplicitClaimCount(graphPartId);
  const nonTopLevelClaimCount = useNonTopLevelClaimCount(graphPartId);

  const onClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      // prevent setting the node as selected because we're about to navigate away from this diagram
      event.stopPropagation();

      if (!rootClaim) return;
      viewJustification(rootClaim.id);
    },
    [rootClaim]
  );

  const Icon = explicitClaimCount > 0 ? AccountTree : AccountTreeOutlined;
  const title =
    "View claim tree" +
    (nonTopLevelClaimCount > 0 ? ` (${nonTopLevelClaimCount} claims not shown here)` : "");

  return (
    <Indicator
      Icon={Icon}
      iconHasBackground={false}
      title={title}
      onClick={explicitClaimCount > 0 ? onClick : undefined}
    />
  );
};
