import { NestedMenuItem } from "mui-nested-menu";

import { researchNodeTypes, structureNodeTypes } from "@/common/node";
import { CloseOnClickMenuItem } from "@/web/common/components/ContextMenu/CloseOnClickMenuItem";
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
  // always showing structure + research nodes seems reasonable. justification nodes never need to be added on their own.
  const shownNodeTypes = structureNodeTypes.concat(researchNodeTypes);

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
