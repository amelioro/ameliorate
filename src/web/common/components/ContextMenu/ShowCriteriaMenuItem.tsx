import { useNodeChildren } from "../../../topic/store/nodeHooks";
import { toggleShowNeighbors } from "../../../topic/store/viewActions";
import { Node } from "../../../topic/utils/diagram";
import { CloseOnClickMenuItem } from "./CloseOnClickMenuItem";

export const ShowCriteriaMenuItem = ({ node }: { node: Node }) => {
  const nodeChildren = useNodeChildren(node.id);

  const criteria = nodeChildren.filter((child) => child.type === "criterion");

  if (node.type !== "problem" || criteria.length === 0) {
    return <></>;
  }

  const allCriteriaShown = criteria.every((child) => child.data.showing);

  return (
    <CloseOnClickMenuItem
      onClick={() => toggleShowNeighbors(node.id, "criterion", "child", !allCriteriaShown)}
    >
      {allCriteriaShown ? "Hide criteria" : "Show criteria"}
    </CloseOnClickMenuItem>
  );
};
