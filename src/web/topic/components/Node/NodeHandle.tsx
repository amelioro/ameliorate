import { memo } from "react";
import { Handle, Position } from "reactflow";

import { useSessionUser } from "@/web/common/hooks";
import { useUserCanEditTopicData } from "@/web/topic/topicStore/store";
import { visibleOnNodeHoverSelectedClasses } from "@/web/topic/utils/styleUtils";

interface Props {
  position: Position;
}

const NodeHandleBase = ({ position }: Props) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const handleType = position === Position.Top || position === Position.Left ? "source" : "target";

  // Show if an edge is being connected from a handle of the opposite type.
  // Easier for us to use css for this because the reactflow store's connectionStartHandle only has
  // source/target, not position, and we need position since our handles can be used for both
  // source/target depending on edge relative placement direction.
  // (note: reactflow v12 adds useConnection which provides start handle position, but we're on v11)
  const showIfConnectingClassName =
    position === Position.Top
      ? String.raw` [.react-flow\_\_nodes:has(.connecting-from.react-flow\_\_handle-bottom)_&]:visible`
      : position === Position.Bottom
        ? String.raw` [.react-flow\_\_nodes:has(.connecting-from.react-flow\_\_handle-top)_&]:visible`
        : position === Position.Left
          ? String.raw` [.react-flow\_\_nodes:has(.connecting-from.react-flow\_\_handle-right)_&]:visible`
          : String.raw` [.react-flow\_\_nodes:has(.connecting-from.react-flow\_\_handle-left)_&]:visible`;

  // if editing, show handles on-hover/-select so that we can create edges
  const showOnHoverSelectClassName = userCanEditTopicData ? visibleOnNodeHoverSelectedClasses : "";

  return (
    <Handle
      type={handleType}
      position={position}
      className={
        // z-index to show in front of EditableNode, which is otherwise in the same stacking context (since it's set to relative positioning now)
        "size-[10px] z-10" +
        // rely on `visibility` rather than `display` so that invisible handles can still render for react-flow's connection drawing
        " invisible" +
        ` ${showIfConnectingClassName}` +
        ` ${showOnHoverSelectClassName}`
      }
    />
  );
};

export const NodeHandle = memo(NodeHandleBase);
