import { ThumbsUpDown, Timeline } from "@mui/icons-material";
import { Divider } from "@mui/material";

import { IndirectHelpIcon } from "@/web/summary/components/IndirectHelpIcon";
import { Row } from "@/web/summary/components/Row";
import { useJustification } from "@/web/topic/diagramStore/summary";
import { Node } from "@/web/topic/utils/graph";

interface Props {
  summaryNode: Node;
}

export const JustificationColumn = ({ summaryNode }: Props) => {
  const { directNodes, indirectNodes } = useJustification(summaryNode);

  // no add buttons to simplify things for now - root claims make this complicated
  const AddButtons = <></>;

  return (
    <div className="flex flex-col">
      <Row
        title="Justification"
        Icon={ThumbsUpDown}
        addButtonsSlot={AddButtons}
        nodes={directNodes}
      />

      <Divider className="mx-2 my-1" />

      <Row
        title="Indirect"
        Icon={Timeline}
        endHeaderSlot={<IndirectHelpIcon />}
        nodes={indirectNodes}
      />
    </div>
  );
};
