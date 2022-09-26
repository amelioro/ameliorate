import { Global } from "@emotion/react";
import { Handle, Position } from "react-flow-renderer";

import {
  AddNodeButtonGroupBottom,
  AddNodeButtonGroupTop,
  Div,
  StyledTextareaAutosize,
  nodeStyles,
} from "./EditableNode.styles";

interface DataProps {
  label: string;
}

interface NodeProps {
  data: DataProps;
}

export function EditableNode({ data }: NodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <AddNodeButtonGroupTop />
      <Div>
        <StyledTextareaAutosize placeholder="Enter text..." defaultValue={data.label} />
      </Div>
      <AddNodeButtonGroupBottom />
      <Handle type="source" position={Position.Bottom} />

      <Global styles={nodeStyles} />
    </>
  );
}
