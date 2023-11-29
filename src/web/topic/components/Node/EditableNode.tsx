import { useTheme } from "@mui/material";
import { useEffect, useRef } from "react";

import { useSessionUser } from "../../../common/hooks";
import { openContextMenu } from "../../../common/store/contextMenuActions";
import { finishAddingNode, setNodeLabel, setSelectedGraphPart } from "../../store/actions";
import { useUserCanEditTopicData } from "../../store/userHooks";
import { Node } from "../../utils/diagram";
import { nodeDecorations } from "../../utils/node";
import { NodeIndicatorGroup } from "../Indicator/NodeIndicatorGroup";
import {
  MiddleDiv,
  NodeDiv,
  NodeTypeDiv,
  NodeTypeSpan,
  StyledTextareaAutosize,
  YEdgeDiv,
} from "./EditableNode.styles";

export const EditableNode = ({ node, className = "" }: { node: Node; className?: string }) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const theme = useTheme();
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (!node.data.newlyAdded || !node.selected || !textAreaRef.current) return;
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

  // prefer this over binding value={node.data.label} because this allows us to update node.data.label onBlur instead of onChange, creating significantly fewer unnecessary re-renders
  useEffect(() => {
    if (!textAreaRef.current || textAreaRef.current.value === node.data.label) return;

    // eslint-disable-next-line functional/immutable-data
    textAreaRef.current.value = node.data.label;
  }, [node.data.label]);

  const nodeDecoration = nodeDecorations[node.type];
  const color = theme.palette[node.type].main;
  const NodeIcon = nodeDecoration.NodeIcon;

  return (
    <NodeDiv
      color={color}
      className={className + (node.selected ? " selected" : "")}
      onClick={() => setSelectedGraphPart(node.id)}
      onContextMenu={(event) => openContextMenu(event, { node })}
    >
      <YEdgeDiv>
        <NodeTypeDiv>
          <NodeIcon sx={{ width: "0.875rem", height: "0.875rem" }} />
          <NodeTypeSpan>{nodeDecoration.title}</NodeTypeSpan>
        </NodeTypeDiv>
        <NodeIndicatorGroup node={node} />
      </YEdgeDiv>
      <MiddleDiv>
        <StyledTextareaAutosize
          ref={textAreaRef}
          color={color}
          placeholder="Enter text..."
          defaultValue={node.data.label}
          maxRows={3}
          onBlur={(event) => {
            if (event.target.value !== node.data.label) setNodeLabel(node, event.target.value);
          }}
          className="nopan" // allow regular text input drag functionality without using reactflow's pan behavior
          // Require selecting a node before editing it, because oftentimes you'll want to select a node to
          // view more details, and the editing will be distracting. Only edit after clicking when selected.
          readOnly={!userCanEditTopicData || !node.selected}
        />
      </MiddleDiv>
    </NodeDiv>
  );
};
