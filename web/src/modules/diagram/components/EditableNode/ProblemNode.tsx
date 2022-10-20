import { useTheme } from "@mui/material";

import { NodeProps } from "../Diagram/Diagram";
import { EditableNode } from "./EditableNode";

export const ProblemNode = (props: NodeProps) => {
  const theme = useTheme();

  return (
    <EditableNode
      {...props}
      color={theme.palette.secondary.main}
      icon="/puzzle.png"
      name="Problem"
    />
  );
};
