import { Global } from "@emotion/react";
import { useTheme } from "@mui/material";
import { Handle, Position } from "reactflow";

import { useDiagramStore } from "../Diagram.store";
import { NodeProps } from "../Diagram/Diagram";
import { ScoreDial } from "../ScoreDial/ScoreDial";
import { NodeDecoration } from "../nodeDecorations";
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

export const EditableNode = ({
  id,
  data,
  themeColor,
  NodeIcon,
  type,
}: NodeProps & NodeDecoration) => {
  const direction = useDiagramStore((state) => state.direction);
  const theme = useTheme();
  const color = theme.palette[themeColor].main;

  // add node button group needs to be type-specific (at least for claim types vs problem/solution types)
  return (
    <>
      <Handle type="target" position={direction == "TB" ? Position.Top : Position.Left} />
      <AddNodeButtonGroupParent nodeId={id} as="Parent" direction={direction} />

      <YEdgeDiv>
        <NodeTypeDiv>
          <NodeIcon sx={{ width: "8px", height: "8px" }} />
          <NodeTypeSpan>{type}</NodeTypeSpan>
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

      <AddNodeButtonGroupChild nodeId={id} as="Child" direction={direction} />
      <Handle type="source" position={direction == "TB" ? Position.Bottom : Position.Right} />

      <Global styles={nodeStyles(data.width, color, type)} />
    </>
  );
};
