import lowerCase from "lodash/lowerCase";
import { NestedMenuItem } from "mui-nested-menu";

import { getSameCategoryEdgeTypes } from "@/common/edge";
import { CloseOnClickMenuItem } from "@/web/common/components/ContextMenu/CloseOnClickMenuItem";
import { useSessionUser } from "@/web/common/hooks";
import { changeEdgeType } from "@/web/topic/store/actions";
import { useUserCanEditTopicData } from "@/web/topic/store/userHooks";
import { Edge } from "@/web/topic/utils/graph";

interface Props {
  edge: Edge;
  parentMenuOpen: boolean;
}

export const ChangeEdgeTypeMenuItem = ({ edge, parentMenuOpen }: Props) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  if (!userCanEditTopicData) return <></>;

  return (
    <>
      <NestedMenuItem
        label="Change edge type"
        parentMenuOpen={parentMenuOpen}
        sx={{
          paddingX: "16px",
          "& p": {
            fontSize: "14px", // match default mui menu item text
            paddingX: 0,
          },
        }}
      >
        {getSameCategoryEdgeTypes(edge.label).map((type) => (
          <CloseOnClickMenuItem
            key={type}
            onClick={() => {
              changeEdgeType(edge, type);
            }}
          >
            {lowerCase(type)}
          </CloseOnClickMenuItem>
        ))}
      </NestedMenuItem>
    </>
  );
};
