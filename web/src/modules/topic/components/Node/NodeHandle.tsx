import { Handle, Position } from "reactflow";

import { RelationDirection } from "../../utils/diagram";
import { Orientation } from "../../utils/layout";

interface Props {
  direction: RelationDirection;
  orientation: Orientation;
}

export const NodeHandle = ({ direction, orientation }: Props) => {
  const type = direction === "parent" ? "target" : "source";

  const position =
    direction === "parent"
      ? orientation === "TB"
        ? Position.Top
        : Position.Left
      : orientation === "TB"
      ? Position.Bottom
      : Position.Right;

  return <Handle type={type} position={position} />;
};
