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
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.id);

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
  }, [node.selected]);

  const nodeDecoration = nodeDecorations[node.type];
  const color = theme.palette[node.type].main;
  const NodeIcon = nodeDecoration.NodeIcon;

  return (
    <NodeDiv
      color={color}
      className={className + (node.selected ? " selected" : "")}
      onClick={() => setSelectedGraphPart(node.id, "node")}
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
          // Will cause re-render on every keystroke because of onChange, hopefully this is fine.
          // Was previously using defaultValue to avoid this, but that caused text to not update
          // when rendering for the second time (1. post-hydration value updating, see store, or
          // 2. when importing a new diagram but the node id's are the same).
          // Also tried using onBlur and setting value via useEffect & useRef, but for some reason that triggered
          // "TextareaAutosize" too many renders error, even though console.log showed each node only rendering twice.
          value={node.data.label}
          maxRows={3}
          onChange={(event) => setNodeLabel(node.id, event.target.value)}
          className="nopan" // allow regular text input drag functionality without using reactflow's pan behavior
          disabled={!userCanEditTopicData}
        />
      </MiddleDiv>
    </NodeDiv>
  );
};
