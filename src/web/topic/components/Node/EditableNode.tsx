import { useTheme } from "@mui/material";
import { useCallback, useEffect, useRef } from "react";

import { RichTextEditor } from "../../../common/components/RichTextEditor/RichTextEditor";
import { useSessionUser } from "../../../common/hooks";
import { openContextMenu } from "../../../common/store/contextMenuActions";
import { useUnrestrictedEditing } from "../../../view/actionConfigStore";
import { setSelected, useIsGraphPartSelected } from "../../../view/navigateStore";
import { finishAddingNode, setCustomNodeType, setNodeLabel } from "../../store/actions";
import { useUserCanEditTopicData } from "../../store/userHooks";
import { Node } from "../../utils/graph";
import { nodeDecorations } from "../../utils/node";
import { NodeIndicatorGroup } from "../Indicator/NodeIndicatorGroup";
import {
  MiddleDiv,
  NodeDiv,
  NodeTypeDiv,
  NodeTypeSpan,
  // StyledTextareaAutosize,
  YEdgeDiv,
} from "./EditableNode.styles";

interface Props {
  node: Node;
  /**
   * If a node is supplemental, clicking it won't select it. This is useful for nodes in the details
   * pane, where you may want to edit text or score without selecting it (and thus displaying a new
   * node's detail pane).
   *
   * Potentially  this could be avoided by turning off "click to select" and requiring clicking on
   * the details button to select, but selecting with a click seems intuitive.
   */
  supplemental?: boolean;
  className?: string;
}

export const EditableNode = ({ node, supplemental = false, className = "" }: Props) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);
  const unrestrictedEditing = useUnrestrictedEditing();
  const selected = useIsGraphPartSelected(node.id);

  const theme = useTheme();
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (!node.data.newlyAdded || !textAreaRef.current) return;
    finishAddingNode(node.id);
    const textArea = textAreaRef.current;

    // No idea why timeout is needed here, but without it, and in the flow, focus is not moved to
    // the text area. It seems specific to react-flow - making a simple button and list of item
    // components, with each item having a useEffect that focuses it, focus is set properly after a
    // new item is rendered.
    setTimeout(() => {
      textArea.focus();
      textArea.setSelectionRange(0, textArea.value.length);
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- if we select the node after initial render, we don't care about re-focusing. we mainly care about focusing on node add. focusing on node click is annoying because our cursor jumps to the end of the input.
  }, []);

  const setLabel = useCallback(
    (html: string) => {
      if (html !== node.data.label) setNodeLabel(node, html);
    },
    [node]
  );

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
  // Supplemental nodes are always editable, because clicking does not select them.
  const editable = userCanEditTopicData && (supplemental || selected);

  const customizable = userCanEditTopicData && (unrestrictedEditing || node.type === "custom");

  return (
    <NodeDiv
      color={color}
      className={className + (selected ? " selected" : "")}
      onClick={() => !supplemental && setSelected(node.id)}
      onContextMenu={(event) => openContextMenu(event, { node })}
    >
      <YEdgeDiv>
        <NodeTypeDiv>
          <NodeIcon sx={{ width: "0.875rem", height: "0.875rem" }} />
          <NodeTypeSpan
            contentEditable={customizable}
            suppressContentEditableWarning // https://stackoverflow.com/a/49639256/8409296
            onBlur={(event) => {
              const text = event.target.textContent?.trim();
              if (text && text !== nodeDecoration.title && text !== node.data.customType)
                setCustomNodeType(node, text);
            }}
            className="nopan"
          >
            {typeText}
          </NodeTypeSpan>
        </NodeTypeDiv>
        <NodeIndicatorGroup node={node} />
      </YEdgeDiv>
      <MiddleDiv>
        {/* <StyledTextareaAutosize
          ref={textAreaRef}
          color={color}
          placeholder="Enter text..."
          defaultValue={node.data.label}
          maxRows={3}
          onBlur={(event) => {
            if (event.target.value !== node.data.label) setNodeLabel(node, event.target.value);
          }}
          className="nopan" // allow regular text input drag functionality without using reactflow's pan behavior
          readOnly={!editable}
        /> */}
        <RichTextEditor text={node.data.label} editable={editable} onBlur={setLabel} />
      </MiddleDiv>
    </NodeDiv>
  );
};
