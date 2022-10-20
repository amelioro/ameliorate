import { Global } from "@emotion/react";
import Image from "next/image";
import { Handle, Position } from "react-flow-renderer";

import { NodeProps } from "../Diagram/Diagram";
import {
  AddNodeButtonGroupChild,
  AddNodeButtonGroupParent,
  MiddleDiv,
  NodeTypeDiv,
  NodeTypeSpan,
  ScoreSpan,
  StyledTextareaAutosize,
  XEdgeDiv,
  YEdgeDiv,
  nodeStyles,
} from "./EditableNode.styles";

interface NodeDecoration {
  color: string;
  icon: string;
  name: string;
}

export const EditableNode = ({ id, data, color, icon, name }: NodeProps & NodeDecoration) => {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <AddNodeButtonGroupParent nodeId={id} as="Parent" />

      <YEdgeDiv>
        <NodeTypeDiv>
          <Image src={icon} width="8" height="8" alt="problem icon" />
          <NodeTypeSpan>{name}</NodeTypeSpan>
        </NodeTypeDiv>
        <ScoreSpan>7</ScoreSpan>
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

      <Global styles={nodeStyles(data.width, color)} />
    </>
  );
};
