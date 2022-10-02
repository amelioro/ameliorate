import { Global } from "@emotion/react";
import { Handle, Position } from "react-flow-renderer";

import {
  AddNodeButtonGroupChild,
  AddNodeButtonGroupParent,
  Div,
  StyledTextareaAutosize,
  nodeStyles,
} from "./EditableNode.styles";

interface NodeProps {
  id: string;
  data: {
    label: string;
  };
}

export const EditableNode = ({ id, data }: NodeProps) => {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <AddNodeButtonGroupParent nodeId={id} as="Parent" />
      <Div>
        <StyledTextareaAutosize placeholder="Enter text..." defaultValue={data.label} />
      </Div>
      <AddNodeButtonGroupChild nodeId={id} as="Child" />
      <Handle type="source" position={Position.Bottom} />

      <Global styles={nodeStyles} />
    </>
  );
};
