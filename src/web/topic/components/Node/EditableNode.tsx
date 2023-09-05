import { useTheme } from "@mui/material";
import { useEffect, useRef } from "react";

import { useSessionUser } from "../../../common/hooks";
import { openContextMenu } from "../../../common/store/contextMenuActions";
import { setNodeLabel, setSelectedGraphPart } from "../../store/actions";
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

// TODO: should not re-render when node position changes
export const EditableNode = ({ node, className = "" }: { node: Node; className?: string }) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const theme = useTheme();
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  // TODO: BUG does not work nicely with the react-flow component. Focus is being taken away from the element after the component mounts.
  useEffect(() => {
    if (!node.selected) return;

    textAreaRef.current?.focus();
    textAreaRef.current?.setSelectionRange(
      textAreaRef.current.value.length,
      textAreaRef.current.value.length
    );
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
          onBlur={(event) => setNodeLabel(node.id, event.target.value)}
          className="nopan" // allow regular text input drag functionality without using reactflow's pan behavior
          disabled={!userCanEditTopicData}
        />
      </MiddleDiv>
    </NodeDiv>
  );
};
