import { openContextMenu } from "@/web/common/store/contextMenuActions";
import { CommonIndicators } from "@/web/topic/components/Indicator/CommonIndicators";
import { ContentIndicators } from "@/web/topic/components/Indicator/ContentIndicators";
import { Edge } from "@/web/topic/utils/graph";
import { setSelected } from "@/web/view/currentViewStore/store";

export const EdgeCell = ({ edge }: { edge: Edge }) => {
  return (
    <div
      className="flex h-full flex-col items-center justify-center"
      onClick={() => setSelected(edge.id)}
      onContextMenu={(event) => openContextMenu(event, { edge })}
      role="button"
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
