import { ChatBubble } from "@mui/icons-material";
import { Link, ListItem, ListItemIcon, ListItemText } from "@mui/material";

import { CommentParentType } from "@/common/comment";
import { Draft } from "@/web/comment/components/Draft";
import { Thread } from "@/web/comment/components/Thread";
import { useResolvedCount, useThreadStarterComments } from "@/web/comment/store/commentStore";
import { useDraft } from "@/web/comment/store/draftStore";
import { useSessionUser } from "@/web/common/hooks";
import { playgroundUsername } from "@/web/topic/store/store";
import { useOnPlayground } from "@/web/topic/store/topicHooks";
import {
  toggleShowResolvedComments,
  useShowResolvedComments,
} from "@/web/view/miscTopicConfigStore";

interface Props {
  parentId: string | null;
  parentType: CommentParentType;
}

export const CommentSection = ({ parentId, parentType }: Props) => {
  const { sessionUser } = useSessionUser();
  const onPlayground = useOnPlayground();
  const myUsername = onPlayground ? playgroundUsername : sessionUser?.username;

  const showResolved = useShowResolvedComments();
  const resolvedCount = useResolvedCount(parentId, parentType);
  const threadStarterComments = useThreadStarterComments(parentId, parentType, showResolved);
  const threadStarterDraft = useDraft(parentId, parentType);

  return (
    <>
      <ListItem disablePadding={false}>
        <ListItemIcon>
          <ChatBubble />
        </ListItemIcon>
        <ListItemText primary="Comments" />
        {resolvedCount > 0 && (
          <Link
            component="button"
            variant="body2"
            onClick={(e) => {
              toggleShowResolvedComments(!showResolved);
              e.preventDefault(); // without this, page refreshes - not sure why, since component is as button, not an anchor
            }}
          >
            {showResolved ? "Hide resolved" : "Show resolved"}
          </Link>
        )}
      </ListItem>

      <ListItem disablePadding={false}>
        <div className="w-full space-y-2 text-wrap text-sm">
          {threadStarterComments.map((comment) => (
            <Thread key={comment.id} myUsername={myUsername} threadStarterComment={comment} />
          ))}

          {threadStarterComments.length === 0 && <p className="text-center">No comments yet!</p>}

          {myUsername && (
            <Draft
              authorName={myUsername}
              parentId={parentId}
              parentType={parentType}
              startingText={threadStarterDraft?.content}
            />
          )}
        </div>
      </ListItem>
    </>
  );
};
