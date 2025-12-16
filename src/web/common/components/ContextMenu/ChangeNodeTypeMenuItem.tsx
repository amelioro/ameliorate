import { useTheme } from "@mui/material/styles";

import { getSameCategoryNodeTypes, prettyNodeTypes } from "@/common/node";
import { ContextMenuItem } from "@/web/common/components/ContextMenu/CloseOnClickMenuItem";
import { NestedMenuItem } from "@/web/common/components/Menu/NestedMenuItem";
import { useSessionUser } from "@/web/common/hooks";
import { changeNodeType } from "@/web/topic/diagramStore/actions";
import { useUserCanEditTopicData } from "@/web/topic/topicStore/store";
import { Node } from "@/web/topic/utils/graph";
import { nodeDecorations } from "@/web/topic/utils/nodeDecoration";

interface Props {
  node: Node;
  parentMenuOpen: boolean;
}

export const ChangeNodeTypeMenuItem = ({ node, parentMenuOpen }: Props) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const theme = useTheme();

  if (!userCanEditTopicData) return <></>;

  return (
    <NestedMenuItem label="Change node type" parentMenuOpen={parentMenuOpen}>
      {getSameCategoryNodeTypes(node.type).map((type) => {
        const { NodeIcon } = nodeDecorations[type];
        const title = prettyNodeTypes[type];

        return (
          <ContextMenuItem key={type} onClick={() => changeNodeType(node, type)}>
            <NodeIcon
              sx={{ backgroundColor: theme.palette[type].main }}
              className="mr-2 rounded-sm p-0.5"
            />
            {title}
          </ContextMenuItem>
        );
      })}
    </NestedMenuItem>
  );
};
