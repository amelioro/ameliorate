import { Timeline } from "@mui/icons-material";
import { Divider, Link } from "@mui/material";

import { IndirectHelpIcon } from "@/web/summary/components/IndirectHelpIcon";
import { Row } from "@/web/summary/components/Row";
import { AddNodeButton } from "@/web/topic/components/Node/AddNodeButton";
import { useSolutions } from "@/web/topic/diagramStore/summary";
import { Node } from "@/web/topic/utils/graph";
import { nodeDecorations } from "@/web/topic/utils/node";
import { viewCriteriaTable } from "@/web/view/currentViewStore/filter";

interface Props {
  summaryNode: Node;
}

export const SolutionsColumn = ({ summaryNode }: Props) => {
  const { directNodes, indirectNodes } = useSolutions(summaryNode);

  const AddButtons = (
    // TODO: implement this based on where we're a problem-like node (e.g. add solution) or a solution-like node (e.g. add mitigation)
    <div className="pb-1.5">
      <AddNodeButton
        fromPartId={summaryNode.id}
        toNodeType="solution"
        as="child"
        relation={{ child: "solution", name: "addresses", parent: summaryNode.type }}
      />
    </div>
  );

  const viewTableAction =
    summaryNode.type === "problem" &&
    directNodes.filter((node) => node.type === "solution").length > 1 ? (
      <Link component="button" variant="body2" onClick={() => viewCriteriaTable(summaryNode.id)}>
        View tradeoffs table
      </Link>
    ) : (
      <></>
    );

  return (
    <div className="flex flex-col">
      <Row
        title="Solutions"
        Icon={nodeDecorations.solution.NodeIcon}
        addButtonsSlot={AddButtons}
        actionSlot={viewTableAction}
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
