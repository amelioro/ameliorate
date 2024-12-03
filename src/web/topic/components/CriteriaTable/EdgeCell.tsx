import { openContextMenu } from "@/web/common/store/contextMenuActions";
import { CommonIndicators } from "@/web/topic/components/Indicator/CommonIndicators";
import { ContentIndicators } from "@/web/topic/components/Indicator/ContentIndicators";
import { Edge } from "@/web/topic/utils/graph";

export const EdgeCell = ({ edge }: { edge: Edge }) => {
  return (
    <div
      className="flex h-full flex-col items-center justify-center"
      onContextMenu={(event) => openContextMenu(event, { edge })}
    >
      <CommonIndicators graphPart={edge} notes={edge.data.notes} />
      <ContentIndicators
        className="ml-0"
        graphPartId={edge.id}
        graphPartType="edge"
        color="paper"
      />
    </div>
  );
};
