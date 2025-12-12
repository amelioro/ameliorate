import { lowerCase } from "es-toolkit";

import { getSameCategoryEdgeTypes } from "@/common/edge";
import { ContextMenuItem } from "@/web/common/components/ContextMenu/CloseOnClickMenuItem";
import { NestedMenuItem } from "@/web/common/components/Menu/NestedMenuItem";
import { useSessionUser } from "@/web/common/hooks";
import { changeEdgeType } from "@/web/topic/diagramStore/actions";
import { useIsTableEdge } from "@/web/topic/diagramStore/edgeHooks";
import { useUserCanEditTopicData } from "@/web/topic/topicStore/store";
import { Edge } from "@/web/topic/utils/graph";

interface Props {
  edge: Edge;
  parentMenuOpen: boolean;
}

export const ChangeEdgeTypeMenuItem = ({ edge, parentMenuOpen }: Props) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const isTableEdge = useIsTableEdge(edge.id);

  if (!userCanEditTopicData) return <></>;
  // don't allow modifying edges that are part of the table, because they should always exist as long as their nodes do
  if (isTableEdge) return <></>;

  return (
    <>
      <NestedMenuItem label="Change edge type" parentMenuOpen={parentMenuOpen}>
        {getSameCategoryEdgeTypes(edge.label).map((type) => (
          <ContextMenuItem
            key={type}
            onClick={() => {
              changeEdgeType(edge, type);
            }}
          >
            {lowerCase(type)}
          </ContextMenuItem>
        ))}
      </NestedMenuItem>
    </>
  );
};
