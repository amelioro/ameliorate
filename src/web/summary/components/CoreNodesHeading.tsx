import { Star } from "@mui/icons-material";

import { compareNodesByType } from "@/common/node";
import { IconWithTooltip } from "@/web/common/components/Tooltip/IconWithTooltip";
import { IconNode } from "@/web/topic/components/Node/IconNode";
import { useRelatedUnrelatedCoreNodes } from "@/web/topic/diagramStore/nodeHooks";
import { useDisplayScores } from "@/web/topic/diagramStore/scoreHooks";
import { Node } from "@/web/topic/utils/graph";
import { getNumericScore } from "@/web/topic/utils/score";
import { setSummaryNodeId } from "@/web/view/currentViewStore/summary";
import { setSelected } from "@/web/view/selectedPartStore";

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
    <div
      // 0.6 alpha to match breadcrumb default - seems kind of nice for making it stand out less
      className="flex items-center gap-1 p-1 text-[rgba(0,0,0,0.6)]"
      onClick={(event) => event.stopPropagation()} // e.g. prevent triggering node deselect from summary background click
    >
      <IconWithTooltip tooltipHeading="Core nodes" icon={<Star fontSize="small" />} />

      {coreNodesSortedByScoreThenType.map((node) => (
        <IconNode
          key={node.id}
          node={node}
          onClick={() => {
            setSelected(node.id);
            setSummaryNodeId(node.id, true);
          }}
          className={node.related ? "" : "opacity-30"}
        />
      ))}
    </div>
  );
};
