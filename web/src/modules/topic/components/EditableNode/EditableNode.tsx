import { Global } from "@emotion/react";
import { useTheme } from "@mui/material";
import _ from "lodash";

import { useDiagramStore } from "../Diagram.store";
import { NodeProps } from "../Diagram/Diagram";
import { ScoreDial } from "../ScoreDial/ScoreDial";
import { NodeType, nodeDecorations } from "../nodeDecorations";
import {
  AddNodeButtonGroupChild,
  AddNodeButtonGroupParent,
  MiddleDiv,
  NodeTypeDiv,
  NodeTypeSpan,
  StyledTextareaAutosize,
  XEdgeDiv,
  YEdgeDiv,
  nodeStyles,
} from "./EditableNode.styles";

export const EditableNode = ({ id, data, type }: NodeProps) => {
  const direction = useDiagramStore((state) => state.direction);
  const theme = useTheme();

  const nodeType = type as NodeType; // we always pass a NodeType from the diagram, but I'm not sure how to override react-flow's type to tell it that
  const nodeDecoration = nodeDecorations[nodeType];
  const color = theme.palette[nodeDecoration.themeColor].main;
  const NodeIcon = nodeDecoration.NodeIcon;

  return (
    <>
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
        />
        <XEdgeDiv />
      </MiddleDiv>
      <YEdgeDiv />

      <AddNodeButtonGroupChild nodeId={id} nodeType={nodeType} as="Child" direction={direction} />

      <Global styles={nodeStyles(data.width, color, nodeType)} />
    </>
  );
};
