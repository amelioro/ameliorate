import { NestedMenuItem } from "mui-nested-menu";

import { getSameCategoryNodeTypes } from "../../../../common/node";
import { changeNodeType } from "../../../topic/store/actions";
import { useUserCanEditTopicData } from "../../../topic/store/userHooks";
import { Node } from "../../../topic/utils/graph";
import { nodeDecorations } from "../../../topic/utils/node";
import { useSessionUser } from "../../hooks";
import { CloseOnClickMenuItem } from "./CloseOnClickMenuItem";

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
