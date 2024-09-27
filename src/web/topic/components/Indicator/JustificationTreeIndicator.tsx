import { AccountTree, AccountTreeOutlined } from "@mui/icons-material";
import { MouseEventHandler, useCallback } from "react";

import { Indicator } from "@/web/topic/components/Indicator/Indicator";
import {
  useJustificationCount,
  useNonTopLevelJustificationCount,
  useRootClaim,
} from "@/web/topic/store/graphPartHooks";
import { viewJustification } from "@/web/view/currentViewStore/filter";

interface Props {
  graphPartId: string;
}

export const JustificationTreeIndicator = ({ graphPartId }: Props) => {
  const rootClaim = useRootClaim(graphPartId);
  const justificationCount = useJustificationCount(graphPartId);
  const nonTopLevelJustificationCount = useNonTopLevelJustificationCount(graphPartId);

  const onClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      // prevent setting the node as selected because we're about to navigate away from this diagram
      event.stopPropagation();

      if (!rootClaim) return;
      viewJustification(rootClaim.id);
    },
    [rootClaim],
  );

  const Icon = justificationCount > 0 ? AccountTree : AccountTreeOutlined;
  const title =
    "View justification tree" +
    (nonTopLevelJustificationCount > 0
      ? ` (${nonTopLevelJustificationCount} justifications not shown here)`
      : "");

  return (
    <Indicator
      Icon={Icon}
      iconHasBackground={false}
      title={title}
      onClick={justificationCount > 0 ? onClick : undefined}
    />
  );
};
