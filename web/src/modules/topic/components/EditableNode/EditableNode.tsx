import { Global } from "@emotion/react";
import { useTheme } from "@mui/material";
import _ from "lodash";
import { Handle, Position } from "reactflow";

import { useDiagramStore } from "../../store/store";
import { NodeProps } from "../Diagram/Diagram";
import { ScoreDial } from "../ScoreDial/ScoreDial";
import { NodeType, nodeDecorations } from "../nodeDecorations";
import {
  AddNodeButtonGroupChild,
  AddNodeButtonGroupParent,
  HoverBridgeDiv,
  MiddleDiv,
  NodeTypeDiv,
  NodeTypeSpan,
  StyledTextareaAutosize,
  XEdgeDiv,
  YEdgeDiv,
  nodeStyles,
} from "./EditableNode.styles";

export const EditableNode = ({ id, data, type }: NodeProps) => {
  const [direction, setNodeLabel] = useDiagramStore((state) => [
    state.direction,
    state.setNodeLabel,
  ]);
  const theme = useTheme();

  const nodeType = type as NodeType; // we always pass a NodeType from the diagram, but I'm not sure how to override react-flow's type to tell it that
  const nodeDecoration = nodeDecorations[nodeType];
  const color = theme.palette[nodeDecoration.themeColor].main;
  const NodeIcon = nodeDecoration.NodeIcon;

  return (
    <>
      <HoverBridgeDiv />

      <Handle type="target" position={direction == "TB" ? Position.Top : Position.Left} />
      {/* should this use react-flow's NodeToolbar? seems like it'd automatically handle positioning */}
      <AddNodeButtonGroupParent nodeId={id} nodeType={nodeType} as="Parent" direction={direction} />

      <YEdgeDiv>
        <NodeTypeDiv>
          <NodeIcon sx={{ width: "16px", height: "16px" }} />
          <NodeTypeSpan>{_.startCase(nodeType)}</NodeTypeSpan>
        </NodeTypeDiv>
        <ScoreDial parentId={id} parentType="node" score={data.score} />
      </YEdgeDiv>
      <MiddleDiv>
        <XEdgeDiv />
        <StyledTextareaAutosize
          color={color}
          placeholder="Enter text..."
          defaultValue={data.label}
          maxRows={3}
          onChange={(event) => setNodeLabel(id, event.target.value)}
          className="nopan" // allow regular text input drag functionality without using reactflow's pan behavior
        />
        <XEdgeDiv />
      </MiddleDiv>
      <YEdgeDiv />

      <AddNodeButtonGroupChild nodeId={id} nodeType={nodeType} as="Child" direction={direction} />
      <Handle type="source" position={direction == "TB" ? Position.Bottom : Position.Right} />

      <Global styles={nodeStyles(data.width, color, nodeType)} />
    </>
  );
};
