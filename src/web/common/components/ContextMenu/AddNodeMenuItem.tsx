import { useTheme } from "@mui/material/styles";
import { NestedMenuItem } from "mui-nested-menu";

import { breakdownNodeTypes, researchNodeTypes } from "@/common/node";
import { ContextMenuItem } from "@/web/common/components/ContextMenu/CloseOnClickMenuItem";
import { useSessionUser } from "@/web/common/hooks";
import { addNodeWithoutParent } from "@/web/topic/diagramStore/createDeleteActions";
import { useUserCanEditTopicData } from "@/web/topic/diagramStore/userHooks";
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

  const theme = useTheme();

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
        {shownNodeTypes.map((type) => {
          const { NodeIcon, title } = nodeDecorations[type];
          return (
            <ContextMenuItem key={type} onClick={() => addNodeWithoutParent(type, "diagram")}>
              <NodeIcon
                sx={{ backgroundColor: theme.palette[type].main }}
                className="mr-2 rounded p-0.5"
              />
              {title}
            </ContextMenuItem>
          );
        })}
      </NestedMenuItem>
    </>
  );
};
