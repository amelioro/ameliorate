import { NestedMenuItem } from "mui-nested-menu";

import { diagramNodeTypes } from "../../../../common/node";
import { addNodeWithoutParent } from "../../../topic/store/createDeleteActions";
import { useUserCanEditTopicData } from "../../../topic/store/userHooks";
import { nodeDecorations } from "../../../topic/utils/node";
import { useActiveView } from "../../../view/navigateStore";
import { useSessionUser } from "../../hooks";
import { CloseOnClickMenuItem } from "./CloseOnClickMenuItem";

interface Props {
  parentMenuOpen: boolean;
}

export const AddNodeMenuItem = ({ parentMenuOpen }: Props) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const activeView = useActiveView();

  // shouldn't be able to view this menu item if we're in the criteria table view
  if (!userCanEditTopicData || activeView == "criteriaTable") return <></>;

  return (
    <>
      <NestedMenuItem
        label="Add node"
        parentMenuOpen={parentMenuOpen}
        sx={{
          paddingX: "16px",
          "& p": {
            fontSize: "14px", // match default mui menu item text
            paddingX: 0,
          },
        }}
      >
        {diagramNodeTypes[activeView].map((type) => (
          <CloseOnClickMenuItem key={type} onClick={() => addNodeWithoutParent(type)}>
            {nodeDecorations[type].title}
          </CloseOnClickMenuItem>
        ))}
      </NestedMenuItem>
    </>
  );
};
