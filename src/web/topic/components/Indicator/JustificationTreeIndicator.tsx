import { AccountTree } from "@mui/icons-material";
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

  const onClick: MouseEventHandler<HTMLButtonElement> = useCallback(() => {
    if (!rootClaim) return;
    viewJustification(rootClaim.id);
  }, [rootClaim]);

  const title =
    "View justification tree" +
    (nonTopLevelJustificationCount > 0
      ? ` (${nonTopLevelJustificationCount} justifications not shown here)`
      : "");

  return (
    <Indicator
      Icon={AccountTree}
      filled={justificationCount > 0}
      title={title}
      onClick={justificationCount > 0 ? onClick : undefined}
    />
  );
};
