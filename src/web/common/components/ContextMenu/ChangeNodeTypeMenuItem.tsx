import { NestedMenuItem } from "mui-nested-menu";

import { getSameCategoryNodeTypes } from "@/common/node";
import { ContextMenuItem } from "@/web/common/components/ContextMenu/CloseOnClickMenuItem";
import { useSessionUser } from "@/web/common/hooks";
import { changeNodeType } from "@/web/topic/store/actions";
import { useUserCanEditTopicData } from "@/web/topic/store/userHooks";
import { Node } from "@/web/topic/utils/graph";
import { nodeDecorations } from "@/web/topic/utils/node";

interface Props {
  node: Node;
  parentMenuOpen: boolean;
}

export const ChangeNodeTypeMenuItem = ({ node, parentMenuOpen }: Props) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  if (!userCanEditTopicData) return <></>;

  return (
    <>
      <NestedMenuItem
        label="Change node type"
        parentMenuOpen={parentMenuOpen}
        // match default mui menu padding and size
        className="px-[16px] [&_p]:px-0 [&_p]:text-sm"
      >
        {getSameCategoryNodeTypes(node.type).map((type) => (
          <ContextMenuItem
            key={type}
            onClick={() => {
              changeNodeType(node, type);
            }}
          >
            {nodeDecorations[type].title}
          </ContextMenuItem>
        ))}
      </NestedMenuItem>
    </>
  );
};
