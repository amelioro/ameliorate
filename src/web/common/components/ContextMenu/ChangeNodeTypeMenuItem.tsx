import { NestedMenuItem } from "mui-nested-menu";

import { getSameCategoryNodeTypes } from "@/common/node";
import { CloseOnClickMenuItem } from "@/web/common/components/ContextMenu/CloseOnClickMenuItem";
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
        sx={{
          paddingX: "16px",
          "& p": {
            fontSize: "14px", // match default mui menu item text
            paddingX: 0,
          },
        }}
      >
        {getSameCategoryNodeTypes(node.type).map((type) => (
          <CloseOnClickMenuItem
            key={type}
            onClick={() => {
              changeNodeType(node, type);
            }}
          >
            {nodeDecorations[type].title}
          </CloseOnClickMenuItem>
        ))}
      </NestedMenuItem>
    </>
  );
};
