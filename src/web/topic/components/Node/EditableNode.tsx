import { type ButtonProps, type SxProps, useTheme } from "@mui/material";
import { memo, useContext } from "react";

import { useSessionUser } from "@/web/common/hooks";
import { openContextMenu } from "@/web/common/store/contextMenuActions";
import { CommonIndicatorGroup } from "@/web/topic/components/Indicator/Base/CommonIndicatorGroup";
import {
  BottomDiv,
  LeftCornerStatusIndicators,
  MiddleDiv,
  NodeBox,
  NodeTypeDiv,
  NodeTypeSpan,
  RightCornerContentIndicators,
  TopDiv,
} from "@/web/topic/components/Node/EditableNode.styles";
import { NodeTextArea } from "@/web/topic/components/Node/NodeTextArea";
import { WorkspaceContext } from "@/web/topic/components/TopicWorkspace/WorkspaceContext";
import { setCustomNodeType } from "@/web/topic/diagramStore/actions";
import { useUserCanEditTopicData } from "@/web/topic/topicStore/store";
import { Node } from "@/web/topic/utils/graph";
import { nodeDecorations } from "@/web/topic/utils/node";
import { useUnrestrictedEditing } from "@/web/view/actionConfigStore";
import { setSelected, useIsGraphPartSelected } from "@/web/view/selectedPartStore";
import { useFillNodesWithColor } from "@/web/view/userConfigStore";

interface Props {
  node: Node;
  className?: string;
}

const EditableNodeBase = ({ node, className = "" }: Props) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const unrestrictedEditing = useUnrestrictedEditing();
  const fillNodesWithColor = useFillNodesWithColor();
  const selected = useIsGraphPartSelected(node.id);
  const context = useContext(WorkspaceContext);

  const theme = useTheme();

  const nodeDecoration = nodeDecorations[node.type];
  const color = theme.palette[node.type].main;
  const NodeIcon = nodeDecoration.NodeIcon;
  const typeText = node.data.customType ?? nodeDecoration.title;

  const customizable = userCanEditTopicData && (unrestrictedEditing || node.type === "custom");

  const backgroundColorType: ButtonProps["color"] =
    fillNodesWithColor || node.type === "custom" ? node.type : "paperPlain";

  // TODO: use `fill-node`/`no-fill-node` class, and extract these to styles file; not sure how to use type-specific colors without js though? maybe css vars for type-specific colors, and a var for the node type that's scoped to the current node?
  const nodeStyles: SxProps =
    fillNodesWithColor || node.type === "custom" // since custom is white, it can't be used as the border color because it doesn't contrast against the white background; so just treat custom as if it's filled with color
      ? {
          backgroundColor: color,
          borderColor: "black",
        }
      : {
          backgroundColor: "white",
          borderColor: color,

          [NodeTypeDiv.toString()]: {
            backgroundColor: color,
            // anti-aliasing between white node background and colored border/icon background creates a gray line - add colored shadow to hide this https://stackoverflow.com/a/40100710/8409296
            // 0.5px spread instead of 1px because 1px creates a really thin shadow on the bottom/right, which can be seen
            // more clearly e.g. when selecting a benefit node (black shadow against bright background)
            boxShadow: `-1px -1px 0px 0.5px ${color}`,
          },

          [`&.selected ${NodeTypeDiv.toString()}`]: {
            // Match the shadow size of not-selected nodes
            boxShadow: `-1px -1px 0px 0.5px black`,
          },

          [`&.spotlight-secondary ${NodeTypeDiv.toString()}`]: {
            // Match the shadow size of not-selected nodes
            boxShadow: `-1px -1px 0px 0.5px ${theme.palette.info.main}`,
          },
        };

  return (
    <NodeBox
      className={
        className +
        // allow other components to apply conditional css related to this node, e.g. when it's hovered/selected
        // separate from react-flow__node because sometimes nodes are rendered outside of react-flow (e.g. details pane), and we still want to style these
        " diagram-node" +
        (selected ? " selected" : "")
      }
      onClick={() => setSelected(node.id)}
      onContextMenu={(event) => openContextMenu(event, { node })}
      role="button"
      sx={nodeStyles}
    >
      <TopDiv className="flex h-6 items-center justify-between">
        {/* pb/pr-0.5 to have 2px of space below/right, to match the 2px border of the node that's above/left of this node type div */}
        <NodeTypeDiv className="flex h-6 items-center rounded-br rounded-tl pb-0.5 pr-0.5">
          <NodeIcon className="mx-1 size-3.5" />
          <NodeTypeSpan
            contentEditable={customizable}
            suppressContentEditableWarning // https://stackoverflow.com/a/49639256/8409296
            onBlur={(event) => {
              const text = event.target.textContent?.trim();
              if (text && text !== nodeDecoration.title && text !== node.data.customType)
                setCustomNodeType(node, text);
            }}
            className={
              "pr-1 text-sm leading-normal" +
              // without nopan, clicking on the span won't let you edit text
              (customizable ? " nopan" : "")
            }
          >
            {typeText}
          </NodeTypeSpan>
        </NodeTypeDiv>
        <CommonIndicatorGroup graphPart={node} />
      </TopDiv>
      {/* grow to fill out remaining space with this div because it contains the textarea */}
      <MiddleDiv className="flex grow px-1 pb-2 pt-1">
        <NodeTextArea
          nodeId={node.id}
          nodeText={node.data.label}
          context={context}
          editable={userCanEditTopicData}
        />
      </MiddleDiv>
      <BottomDiv className="relative">
        {node.type !== "rootClaim" && ( // root claim indicators don't seem very helpful
          <>
            {/* TODO?: how to make corner indicators not look bad in the table? they're cut off */}
            <LeftCornerStatusIndicators
              graphPartId={node.id}
              color={backgroundColorType}
              notes={node.data.notes}
            />
            <RightCornerContentIndicators
              graphPartId={node.id}
              graphPartType="node"
              color={backgroundColorType}
            />
          </>
        )}
      </BottomDiv>
    </NodeBox>
  );
};

export const EditableNode = memo(EditableNodeBase);
