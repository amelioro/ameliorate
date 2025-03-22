import { ControlCamera } from "@mui/icons-material";
import { useContext } from "react";

import { ViewIndicator } from "@/web/topic/components/Indicator/Base/ViewIndicator";
import { WorkspaceContext } from "@/web/topic/components/TopicWorkspace/WorkspaceContext";
import { diagramPartContextMethods } from "@/web/topic/utils/diagramPartContext";
import { GraphPart, isNode } from "@/web/topic/utils/graph";

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

  const partContextMethods = fulfillsOutOfTable ? undefined : diagramPartContextMethods[type];

  const useHasContext = partContextMethods?.useHasContext ?? (() => false);
  const hasContext = useHasContext(graphPart.id);

  if (!partContextMethods) return <></>;

  return (
    <ViewIndicator
      Icon={ControlCamera}
      filled={hasContext}
      title={"View context in diagram"}
      onClick={() => partContextMethods.viewContext(graphPart.id)}
    />
  );
};
