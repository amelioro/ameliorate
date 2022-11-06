import { Global } from "@emotion/react";
import { useTheme } from "@mui/material";
import Image from "next/image";
import { Handle, Position } from "reactflow";

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
  iconSrc,
  type,
}: NodeProps & NodeDecoration) => {
  const theme = useTheme();
  const color = theme.palette[themeColor].main;

  // add node button group needs to be type-specific (at least for claim types vs problem/solution types)
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <AddNodeButtonGroupParent nodeId={id} as="Parent" />

      <YEdgeDiv>
        <NodeTypeDiv>
          <Image src={iconSrc} width="8" height="8" alt={`${type} icon`} />
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

      <AddNodeButtonGroupChild nodeId={id} as="Child" />
      <Handle type="source" position={Position.Bottom} />

      <Global styles={nodeStyles(data.width, color, type)} />
    </>
  );
};
