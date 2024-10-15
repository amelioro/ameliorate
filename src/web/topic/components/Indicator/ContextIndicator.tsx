import { ControlCamera } from "@mui/icons-material";

import { Indicator } from "@/web/topic/components/Indicator/Indicator";
import { GraphPart, isNode } from "@/web/topic/utils/graph";
import { contextMethods } from "@/web/topic/utils/partContext";

interface Props {
  graphPart: GraphPart;
}

export const ContextIndicator = ({ graphPart }: Props) => {
  const type = isNode(graphPart) ? graphPart.type : graphPart.label;
  const partContextMethods = contextMethods[type];

  const useHasContext = partContextMethods?.useHasContext ?? (() => false);
  const hasContext = useHasContext(graphPart.id);

  if (!partContextMethods) return <></>;

  return (
    <Indicator
      Icon={ControlCamera}
      iconHasBackground={false}
      filled={hasContext}
      title={"View context"}
      onClick={() => partContextMethods.viewContext(graphPart.id)}
    />
  );
};
