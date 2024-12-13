import { Article, ChatBubble, School, ThumbsUpDown } from "@mui/icons-material";
import { Divider, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";

import { StandaloneEdge } from "@/web/topic/components/Edge/StandaloneEdge";
import { EditableNode } from "@/web/topic/components/Node/EditableNode";
import { CommentSection } from "@/web/topic/components/TopicPane/CommentSection";
import { DetailsBasicsSection } from "@/web/topic/components/TopicPane/DetailsBasicsSection";
import { DetailsJustificationSection } from "@/web/topic/components/TopicPane/DetailsJustificationSection";
import { DetailsResearchSection } from "@/web/topic/components/TopicPane/DetailsResearchSection";
import { GraphPart, isNode } from "@/web/topic/utils/graph";

interface Props {
  graphPart: GraphPart;
}

export const GraphPartDetails = ({ graphPart }: Props) => {
  const partIsNode = isNode(graphPart);

  return (
    <List>
      <div className="flex flex-col items-center">
        {partIsNode ? (
          // z-index to ensure hanging node indicators don't fall behind the next section's empty background
          <EditableNode node={graphPart} className="z-10" />
        ) : (
          <StandaloneEdge edge={graphPart} />
        )}
      </div>

      {/* mt-2 to match distance from Tabs look to graph part */}
      <Divider className="mb-1 mt-2" />
      <ListItem disablePadding={false}>
        <ListItemIcon>
          <Article />
        </ListItemIcon>
        <ListItemText primary="Basics" />
      </ListItem>
      <DetailsBasicsSection graphPart={graphPart} />

      <Divider className="my-1" />
      <ListItem disablePadding={false}>
        <ListItemIcon>
          <ThumbsUpDown />
        </ListItemIcon>
        <ListItemText primary="Justification" />
      </ListItem>
      <DetailsJustificationSection graphPart={graphPart} />

      {/* prevent adding research nodes to edges; not 100% sure that we want to restrict this, but if it continues to seem good, this section can accept node instead of graphPart */}
      {partIsNode && (
        <>
          <Divider className="my-1" />
          <ListItem disablePadding={false}>
            <ListItemIcon>
              <School />
            </ListItemIcon>
            <ListItemText primary="Research" />
          </ListItem>
          <DetailsResearchSection node={graphPart} />
        </>
      )}

      <Divider className="my-1" />
      <ListItem disablePadding={false}>
        <ListItemIcon>
          <ChatBubble />
        </ListItemIcon>
        <ListItemText primary="Comments" />
      </ListItem>
      <CommentSection parentId={graphPart.id} parentType={partIsNode ? "node" : "edge"} />
    </List>
  );
};
