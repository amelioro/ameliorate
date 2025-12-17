import { Handle, Position } from "@xyflow/react";
import { memo } from "react";

import { useSessionUser } from "@/web/common/hooks";
import { useUserCanEditTopicData } from "@/web/topic/topicStore/store";
import { visibleOnNodeHoverSelectedClasses } from "@/web/topic/utils/styleUtils";

interface Props {
  id: string;
  position: Position;
}

const NodeHandleBase = ({ id, position }: Props) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  // Show if an edge is being connected from a handle of the opposite type.
  // Could use reactflow's `useConnection` for this to be simpler logic, but that triggers thousands
  // of selector checks because it checks on _every_ mouse move. Doesn't seem worth that since we
  // can do it this way.
  const showIfConnectingClassName =
    position === Position.Top
      ? String.raw` [.react-flow\_\_nodes:has(.connectingfrom.react-flow\_\_handle-bottom)_&]:visible`
      : position === Position.Bottom
        ? String.raw` [.react-flow\_\_nodes:has(.connectingfrom.react-flow\_\_handle-top)_&]:visible`
        : position === Position.Left
          ? String.raw` [.react-flow\_\_nodes:has(.connectingfrom.react-flow\_\_handle-right)_&]:visible`
          : String.raw` [.react-flow\_\_nodes:has(.connectingfrom.react-flow\_\_handle-left)_&]:visible`;

  // if editing, show handles on-hover/-select so that we can create edges
  const showOnHoverSelectClassName = userCanEditTopicData ? visibleOnNodeHoverSelectedClasses : "";

  return (
    <Handle
      id={id}
      // reactflow bidirectional example uses "source" for both handles, so we're going to do that (though it shouldn't matter which type we use) https://reactflow.dev/examples/edges/custom-edges
      type="source"
      position={position}
      className={
        // z-index to show in front of EditableNode, which is otherwise in the same stacking context (since it's set to relative positioning now)
        "size-2.5 z-10" +
        // rely on `visibility` rather than `display` so that invisible handles can still render for react-flow's connection drawing
        " invisible" +
        ` ${showIfConnectingClassName}` +
        ` ${showOnHoverSelectClassName}`
      }
    />
  );
};

export const NodeHandle = memo(NodeHandleBase);
