import { NestedMenuItem } from "mui-nested-menu";

import { breakdownNodeTypes, researchNodeTypes } from "@/common/node";
import { ContextMenuItem } from "@/web/common/components/ContextMenu/CloseOnClickMenuItem";
import { useSessionUser } from "@/web/common/hooks";
import { addNodeWithoutParent } from "@/web/topic/store/createDeleteActions";
import { useUserCanEditTopicData } from "@/web/topic/store/userHooks";
import { nodeDecorations } from "@/web/topic/utils/node";
import { useFormat } from "@/web/view/currentViewStore/store";

interface Props {
  parentMenuOpen: boolean;
}

export const AddNodeMenuItem = ({ parentMenuOpen }: Props) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const format = useFormat();

  // could try just using primary node types, but that's awkward when all info categories are hidden.
  // always showing breakdown + research nodes seems reasonable. justification nodes never need to be added on their own.
  const shownNodeTypes = breakdownNodeTypes.concat(researchNodeTypes);

  // shouldn't be able to view this menu item if we're in the table view
  if (!userCanEditTopicData || format == "table") return <></>;

  return (
    <>
      <NestedMenuItem
        label="Add node"
        parentMenuOpen={parentMenuOpen}
        // match default mui menu padding and size
        className="px-[16px] [&_p]:px-0 [&_p]:text-sm"
      >
        {shownNodeTypes.map((type) => (
          <ContextMenuItem key={type} onClick={() => addNodeWithoutParent(type, "diagram")}>
            {nodeDecorations[type].title}
          </ContextMenuItem>
        ))}
      </NestedMenuItem>
    </>
  );
};
