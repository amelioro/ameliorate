import { ControlCamera } from "@mui/icons-material";
import { useContext } from "react";

import { Indicator } from "@/web/topic/components/Indicator/Indicator";
import { WorkspaceContext } from "@/web/topic/components/TopicWorkspace/WorkspaceContext";
import { GraphPart, isNode } from "@/web/topic/utils/graph";
import { contextMethods } from "@/web/topic/utils/partContext";

interface Props {
  graphPart: GraphPart;
}

export const ContextIndicator = ({ graphPart }: Props) => {
  const workspaceContext = useContext(WorkspaceContext);

  const type = isNode(graphPart) ? graphPart.type : graphPart.label;

  // Fulfills edges could show between criterion and benefits, but we only care about those between criterion and solutions.
  // The simple jank-ish solution is to only show this indicator in the table view (for fulfills edges), since that'll only show criterion-solution edges.
  // We likely won't care about this indicator for fulfills edges in the diagram view anyway.
  const fulfillsOutOfTable = type === "fulfills" && workspaceContext !== "table";

  const partContextMethods = fulfillsOutOfTable ? undefined : contextMethods[type];

  const useHasContext = partContextMethods?.useHasContext ?? (() => false);
  const hasContext = useHasContext(graphPart.id);

  if (!partContextMethods) return <></>;

  return (
    <Indicator
      Icon={ControlCamera}
      iconHasBackground={false}
      filled={hasContext}
      title={"View context"}
      onClick={() => partContextMethods.viewContext(graphPart.id)}
    />
  );
};
