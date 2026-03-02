import { useMemo } from "react";

import { Select } from "@/web/common/components/Form/Select";
import { ColoredNodeIcon } from "@/web/topic/components/ColoredNodeIcon";
import { Node } from "@/web/topic/utils/graph";

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
      return {
        id: node.id,
        label: node.data.text,
        beforeSlot: <ColoredNodeIcon type={node.type} className="mr-2 rounded-sm p-0.5" />,
      };
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
