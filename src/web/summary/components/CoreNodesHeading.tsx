import { Star } from "@mui/icons-material";

import { compareNodesByType } from "@/common/node";
import { IconWithTooltip } from "@/web/common/components/Tooltip/IconWithTooltip";
import { IconNode } from "@/web/topic/components/Node/IconNode";
import { useRelatedUnrelatedCoreNodes } from "@/web/topic/diagramStore/nodeHooks";
import { useDisplayScores } from "@/web/topic/diagramStore/scoreHooks";
import { Node } from "@/web/topic/utils/graph";
import { getNumericScore } from "@/web/topic/utils/score";

export const CoreNodesHeading = ({ summaryNode }: { summaryNode: Node | null }) => {
  const coreNodes = useRelatedUnrelatedCoreNodes(summaryNode);

  const { scoresByGraphPartId } = useDisplayScores(coreNodes.map((node) => node.id));

  const coreNodesSortedByScoreThenType = coreNodes.toSorted((node1, node2) => {
    const score1 = getNumericScore(scoresByGraphPartId[node1.id] ?? "-");
    const score2 = getNumericScore(scoresByGraphPartId[node2.id] ?? "-");

    if (score1 !== score2) return score2 - score1; // sort by score descending

    return compareNodesByType(node1, node2);
  });

  return (
    <div className="flex max-w-[50%] items-center gap-1 overflow-x-auto p-1">
      <IconWithTooltip tooltipHeading="Core nodes" icon={<Star fontSize="small" />} />

      {coreNodesSortedByScoreThenType.map((node) => (
        <IconNode key={node.id} node={node} className={node.related ? "" : "opacity-30"} />
      ))}
    </div>
  );
};
