import { NestedMenuItem } from "mui-nested-menu";

import { CloseOnClickMenuItem } from "@/web/common/components/ContextMenu/CloseOnClickMenuItem";
import { useSessionUser } from "@/web/common/hooks";
import { addNodeWithoutParent } from "@/web/topic/store/createDeleteActions";
import { useUserCanEditTopicData } from "@/web/topic/store/userHooks";
import { nodeDecorations } from "@/web/topic/utils/node";
import { usePrimaryNodeTypes } from "@/web/view/currentViewStore/filter";
import { useFormat } from "@/web/view/currentViewStore/store";

interface Props {
  parentMenuOpen: boolean;
}

export const AddNodeMenuItem = ({ parentMenuOpen }: Props) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const format = useFormat();
  const shownNodeTypes = usePrimaryNodeTypes();

  // shouldn't be able to view this menu item if we're in the table view
  if (!userCanEditTopicData || format == "table") return <></>;

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
        {shownNodeTypes.map((type) => (
          <CloseOnClickMenuItem key={type} onClick={() => addNodeWithoutParent(type, "diagram")}>
            {nodeDecorations[type].title}
          </CloseOnClickMenuItem>
        ))}
      </NestedMenuItem>
    </>
  );
};
