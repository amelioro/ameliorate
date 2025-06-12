import { getLinkToPart } from "@/common/diagramPart";
import { ContextMenuItem } from "@/web/common/components/ContextMenu/CloseOnClickMenuItem";
import { getTopic } from "@/web/topic/topicStore/store";
import { GraphPart, isNode } from "@/web/topic/utils/graph";
import { getSelectedViewTitle } from "@/web/view/quickViewStore/store";

export const CopyLinkToPartMenuItem = ({ graphPart }: { graphPart: GraphPart }) => {
  return (
    <ContextMenuItem
      onClick={() => {
        const shortPartId = graphPart.id.substring(0, 8); // shorten for URL readability; 8 chars should be enough for ~10000 unique parts
        const currentTopic = getTopic();
        const currentViewTitle = getSelectedViewTitle();
        const url = getLinkToPart(shortPartId, currentTopic, currentViewTitle ?? undefined);

        void navigator.clipboard.writeText(url);
      }}
    >
      Copy link to {isNode(graphPart) ? "node" : "edge"}
    </ContextMenuItem>
  );
};
