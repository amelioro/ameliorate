import { getSameCategoryNodeTypes, prettyNodeTypes } from "@/common/node";
import { ContextMenuItem } from "@/web/common/components/ContextMenu/CloseOnClickMenuItem";
import { NestedMenuItem } from "@/web/common/components/Menu/NestedMenuItem";
import { useSessionUser } from "@/web/common/hooks";
import { ColoredNodeIcon } from "@/web/topic/components/ColoredNodeIcon";
import { changeNodeType } from "@/web/topic/diagramStore/actions";
import { useUserCanEditTopicData } from "@/web/topic/topicStore/store";
import { Node } from "@/web/topic/utils/graph";

interface Props {
  node: Node;
  parentMenuOpen: boolean;
}

export const ChangeNodeTypeMenuItem = ({ node, parentMenuOpen }: Props) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  if (!userCanEditTopicData) return <></>;

  return (
    <NestedMenuItem label="Change node type" parentMenuOpen={parentMenuOpen}>
      {getSameCategoryNodeTypes(node.type).map((type) => {
        const title = prettyNodeTypes[type];

        return (
          <ContextMenuItem key={type} onClick={() => changeNodeType(node, type)}>
            <ColoredNodeIcon type={type} className="mr-2 rounded-sm p-0.5" />
            {title}
          </ContextMenuItem>
        );
      })}
    </NestedMenuItem>
  );
};
