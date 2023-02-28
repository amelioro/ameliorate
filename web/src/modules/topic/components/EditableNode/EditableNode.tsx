import { useTheme } from "@mui/material";
import _ from "lodash";
import { useEffect, useRef } from "react";

import { openContextMenu } from "../../../../common/store/contextMenuActions";
import { setNodeLabel } from "../../store/actions";
import { Node } from "../../utils/diagram";
import { nodeDecorations } from "../../utils/nodes";
import { ClaimIndicator } from "../ClaimIndicator/ClaimIndicator";
import { CriteriaIndicator } from "../CriteriaIndicator/CriteriaIndicator";
import { CriteriaTableIndicator } from "../CriteriaTableIndicator/CriteriaTableIndicator";
import { ScoreDial } from "../ScoreDial/ScoreDial";
import {
  IndicatorDiv,
  MiddleDiv,
  NodeDiv,
  NodeTypeDiv,
  NodeTypeSpan,
  StyledTextareaAutosize,
  XEdgeDiv,
  YEdgeDiv,
} from "./EditableNode.styles";

export const EditableNode = ({ node }: { node: Node }) => {
  const theme = useTheme();
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  // TODO: BUG does not work nicely with the react-flow component. Focus is being taken away from the element after the component mounts.
  useEffect(() => {
    textAreaRef.current?.focus();
    textAreaRef.current?.setSelectionRange(
      textAreaRef.current.value.length,
      textAreaRef.current.value.length
    );
  }, []);

  const nodeDecoration = nodeDecorations[node.type];
  const color = theme.palette[node.type].main;
  const NodeIcon = nodeDecoration.NodeIcon;

  return (
    <NodeDiv
      color={color}
      className={node.selected ? "selected" : ""}
      onContextMenu={(event) => openContextMenu(event, { node })}
    >
      <YEdgeDiv>
        <NodeTypeDiv>
          <NodeIcon sx={{ width: "16px", height: "16px" }} />
          <NodeTypeSpan>{_.startCase(node.type)}</NodeTypeSpan>
        </NodeTypeDiv>
        <IndicatorDiv>
          <CriteriaTableIndicator nodeId={node.id} diagramId={node.data.diagramId} />
          <CriteriaIndicator nodeId={node.id} diagramId={node.data.diagramId} />
          <ClaimIndicator scorableId={node.id} scorableType="node" />
          <ScoreDial scorableId={node.id} scorableType="node" score={node.data.score} />
        </IndicatorDiv>
      </YEdgeDiv>
      <MiddleDiv>
        <XEdgeDiv />
        <StyledTextareaAutosize
          ref={textAreaRef}
          color={color}
          placeholder="Enter text..."
          // Will cause re-render on every keystroke because of onChange, hopefully this is fine.
          // Was previously using defaultValue to avoid this, but that caused text to not update
          // when rendering for the second time (1. post-hydration value updating, see store, or
          // 2. when importing a new diagram but the node id's are the same).
          value={node.data.label}
          maxRows={3}
          onChange={(event) => setNodeLabel(node.id, event.target.value)}
          className="nopan" // allow regular text input drag functionality without using reactflow's pan behavior
        />
        <XEdgeDiv />
      </MiddleDiv>
      <YEdgeDiv />
    </NodeDiv>
  );
};
