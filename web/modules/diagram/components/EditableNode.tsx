import { TextareaAutosize } from "@mui/material";
import { Handle, Position } from "react-flow-renderer";

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
      <TextareaAutosize
        placeholder="Enter text..."
        defaultValue={data.label}
        style={{
          width: "100%",
          border: 0,
          resize: "none",
          outline: "none",
          textAlign: "center",
        }}
      />
      <Handle type="source" position={Position.Bottom} />

      <style jsx global>{`
        /* copied from https://github.com/wbkd/react-flow/blob/147656b22f577bb4141664d000e62ada9b490473/src/theme-default.css#L42-L77 */
        .react-flow__node-editable {
          padding: 10px;
          border-radius: 3px;
          width: 150px;
          font-size: 12px;
          color: #222;
          text-align: center;
          border-width: 1px;
          border-style: solid;
          background: #fff;
          border-color: #1a192b;
          display: flex;

          &.selected {
            box-shadow: 0 0 0 0.5px #1a192b;
          }

          .react-flow__handle {
            background: #1a192b;
          }
        }

        .react-flow__node-editable.selectable {
          &:hover {
            box-shadow: 0 1px 4px 1px rgba(0, 0, 0, 0.08);
          }

          &.selected {
            box-shadow: 0 0 0 0.5px #1a192b;
          }
        }
      `}</style>
    </>
  );
}
