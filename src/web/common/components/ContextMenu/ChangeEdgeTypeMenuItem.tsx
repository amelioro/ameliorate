import lowerCase from "lodash/lowerCase";
import { NestedMenuItem } from "mui-nested-menu";

import { getSiblingEdgeTypes } from "../../../../common/edge";
import { changeEdgeType } from "../../../topic/store/actions";
import { useUserCanEditTopicData } from "../../../topic/store/userHooks";
import { Edge } from "../../../topic/utils/graph";
import { useSessionUser } from "../../hooks";
import { CloseOnClickMenuItem } from "./CloseOnClickMenuItem";

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
        {getSiblingEdgeTypes(edge.label).map((type) => (
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
