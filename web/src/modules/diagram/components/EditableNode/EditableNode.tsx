import { Global } from "@emotion/react";
import { Handle, Position } from "react-flow-renderer";

import { As } from "../../../../pages";
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
    addNode: (_toNode: string, _as: As) => void;
  };
}

export function EditableNode({ id, data }: NodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <AddNodeButtonGroupParent addNode={data.addNode} nodeId={id} as="Parent" />
      <Div>
        <StyledTextareaAutosize placeholder="Enter text..." defaultValue={data.label} />
      </Div>
      <AddNodeButtonGroupChild addNode={data.addNode} nodeId={id} as="Child" />
      <Handle type="source" position={Position.Bottom} />

      <Global styles={nodeStyles} />
    </>
  );
}
