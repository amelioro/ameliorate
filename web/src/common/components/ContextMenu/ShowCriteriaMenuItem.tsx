import { toggleShowCriteria } from "../../../modules/topic/store/actions";
import { useNodeChildren } from "../../../modules/topic/store/nodeHooks";
import { Node } from "../../../modules/topic/utils/diagram";
import { CloseOnClickMenuItem } from "./CloseOnClickMenuItem";

export const ShowCriteriaMenuItem = ({ node }: { node: Node }) => {
  const nodeChildren = useNodeChildren(node.id, node.data.diagramId);

  const criteria = nodeChildren.filter((child) => child.type === "criterion");

  if (node.type !== "problem" || criteria.length === 0) {
    return <></>;
  }

  const allCriteriaShown = criteria.every((child) => child.data.showing);

  return (
    <CloseOnClickMenuItem onClick={() => toggleShowCriteria(node.id, !allCriteriaShown)}>
      {allCriteriaShown ? "Hide criteria" : "Show criteria"}
    </CloseOnClickMenuItem>
  );
};
