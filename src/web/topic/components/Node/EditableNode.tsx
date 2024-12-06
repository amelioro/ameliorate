import { type ButtonProps, type SxProps, useTheme } from "@mui/material";
import { memo, useContext, useEffect, useRef } from "react";

import { useSessionUser } from "@/web/common/hooks";
import { openContextMenu } from "@/web/common/store/contextMenuActions";
import { clearNewlyAddedNode, isNodeNewlyAdded } from "@/web/common/store/ephemeralStore";
import { CommonIndicators } from "@/web/topic/components/Indicator/CommonIndicators";
import {
  BottomDiv,
  LeftCornerStatusIndicators,
  MiddleDiv,
  NodeBox,
  NodeTypeDiv,
  NodeTypeSpan,
  RightCornerContentIndicators,
  StyledTextareaAutosize,
  TopDiv,
} from "@/web/topic/components/Node/EditableNode.styles";
import { WorkspaceContext } from "@/web/topic/components/TopicWorkspace/WorkspaceContext";
import { setCustomNodeType, setNodeLabel } from "@/web/topic/store/actions";
import { useUserCanEditTopicData } from "@/web/topic/store/userHooks";
import { Node } from "@/web/topic/utils/graph";
import { nodeDecorations } from "@/web/topic/utils/node";
import { useUnrestrictedEditing } from "@/web/view/actionConfigStore";
import { setSelected, useIsGraphPartSelected } from "@/web/view/currentViewStore/store";
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
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const textAreaId = `${node.id}-${context}-textarea`;

  useEffect(() => {
    if (!isNodeNewlyAdded(node.id, context)) return;

    clearNewlyAddedNode();

    // Focus newly added node's text.
    // Using timeout because textarea doesn't pull focus via `.focus()` without it. textarea is in DOM at this point, so I'm not sure why.
    setTimeout(() => {
      // Using getElementById instead of ref because ref.current is null after the timeout runs, unless timeout = 0 ms.
      // But when timeout = 0 ms, while focus is successfully pulled to the textarea, focus is pulled back to document body afterwards for some reason.
      // Think that's something to do with how we're rendering the diagram - it doesn't happen for details/table nodes.
      const textAreaEl = document.getElementById(textAreaId) as HTMLTextAreaElement | null;
      textAreaEl?.focus();
      textAreaEl?.setSelectionRange(0, textAreaEl.value.length);
    }, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't care about re-focusing after initial render
  }, []);

  // prefer this over binding value={node.data.label} because this allows us to update node.data.label onBlur instead of onChange, creating significantly fewer unnecessary re-renders
  if (textAreaRef.current && textAreaRef.current.value !== node.data.label) {
    // eslint-disable-next-line functional/immutable-data
    textAreaRef.current.value = node.data.label;
  }

  const nodeDecoration = nodeDecorations[node.type];
  const color = theme.palette[node.type].main;
  const NodeIcon = nodeDecoration.NodeIcon;
  const typeText = node.data.customType ?? nodeDecoration.title;

  // Require selecting a node before editing it, because oftentimes you'll want to select a node to
  // view more details, and the editing will be distracting. Only edit after clicking when selected.
  // Details nodes are always editable, because clicking does not select them.
  const editable = userCanEditTopicData && (context === "details" || selected);

  const customizable = userCanEditTopicData && (unrestrictedEditing || node.type === "custom");

  const backgroundColorType: ButtonProps["color"] =
    fillNodesWithColor || node.type === "custom" ? node.type : "paper";

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
            boxShadow: `-1px -1px 0px 1px ${color}`,
          },

          [`&.selected ${NodeTypeDiv.toString()}`]: {
            boxShadow: "-1px -1px 0px 1px black",
          },

          [`&.spotlight-secondary ${NodeTypeDiv.toString()}`]: {
            boxShadow: `-1px -1px 0px 1px ${theme.palette.info.main}`,
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
      onClick={() => {
        if (context != "details") setSelected(node.id);
      }}
      onContextMenu={(event) => openContextMenu(event, { node })}
      sx={nodeStyles}
    >
      <TopDiv className="flex h-6 items-center justify-between">
        <NodeTypeDiv className="flex h-6 items-center rounded-br rounded-tl">
          <NodeIcon className="mx-1 size-3.5" />
          <NodeTypeSpan
            contentEditable={customizable}
            suppressContentEditableWarning // https://stackoverflow.com/a/49639256/8409296
            onBlur={(event) => {
              const text = event.target.textContent?.trim();
              if (text && text !== nodeDecoration.title && text !== node.data.customType)
                setCustomNodeType(node, text);
            }}
            className="nopan pr-1 text-sm leading-none"
          >
            {typeText}
          </NodeTypeSpan>
        </NodeTypeDiv>
        <CommonIndicators graphPart={node} notes={node.data.notes} />
      </TopDiv>
      {/* grow to fill out remaining space with this div because it contains the textarea */}
      <MiddleDiv className="flex grow px-1 pb-2 pt-1">
        <StyledTextareaAutosize
          id={textAreaId}
          ref={textAreaRef}
          placeholder="Enter text..."
          defaultValue={node.data.label}
          maxRows={3}
          onBlur={(event) => {
            if (event.target.value !== node.data.label) setNodeLabel(node, event.target.value);
          }}
          className="nopan" // allow regular text input drag functionality without using reactflow's pan behavior
          readOnly={!editable}
        />
      </MiddleDiv>
      <BottomDiv className="relative">
        {node.type !== "rootClaim" && ( // root claim indicators don't seem very helpful
          <>
            {/* TODO?: how to make corner indicators not look bad in the table? they're cut off */}
            <LeftCornerStatusIndicators graphPartId={node.id} color={backgroundColorType} />
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
