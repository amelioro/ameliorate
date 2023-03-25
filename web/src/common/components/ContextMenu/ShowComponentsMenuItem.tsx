import { useNodeParents } from "../../../modules/topic/store/nodeHooks";
import { toggleShowNeighbors } from "../../../modules/topic/store/viewActions";
import { Node } from "../../../modules/topic/utils/diagram";
import { CloseOnClickMenuItem } from "./CloseOnClickMenuItem";

export const ShowComponentsMenuItem = ({ node }: { node: Node }) => {
  const nodeParents = useNodeParents(node.id, node.data.diagramId);

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
