import { useMemo } from "react";

import { Node } from "../../../topic/utils/graph";
import { Select } from "./Select";

interface Props {
  name: string;
  label?: string;
  useNodeOptions: () => Node[];
  multiple?: boolean;
  disableClearable?: boolean;
}

export const NodeSelect = ({
  name,
  label,
  useNodeOptions,
  multiple = false,
  disableClearable,
}: Props) => {
  const nodeOptions = useNodeOptions();

  const options = useMemo(() => {
    return nodeOptions.map((node) => {
      return { id: node.id, label: node.data.label };
    });
  }, [nodeOptions]);

  return (
    <Select
      name={name}
      label={label}
      options={options}
      multiple={multiple}
      disableClearable={disableClearable}
    />
  );
};
