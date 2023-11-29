import { useNodeParents } from "../../../topic/store/nodeHooks";
import { toggleShowNeighbors } from "../../../topic/store/viewActions";
import { Node } from "../../../topic/utils/diagram";
import { CloseOnClickMenuItem } from "./CloseOnClickMenuItem";

export const ShowComponentsMenuItem = ({ node }: { node: Node }) => {
  const nodeParents = useNodeParents(node.id);

  const components = nodeParents.filter((child) => child.type === "solutionComponent");

  if (node.type !== "solution" || components.length === 0) {
    return <></>;
  }

  const allComponentsShown = components.every((child) => child.data.showing);

  return (
    <CloseOnClickMenuItem
      onClick={() =>
        toggleShowNeighbors(node.id, "solutionComponent", "parent", !allComponentsShown)
      }
    >
      {allComponentsShown ? "Hide components" : "Show components"}
    </CloseOnClickMenuItem>
  );
};
