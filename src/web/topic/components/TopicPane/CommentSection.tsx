import { Link } from "@mui/material";

import { CommentParentType } from "@/common/comment";
import { Draft } from "@/web/comment/components/Draft";
import { Thread } from "@/web/comment/components/Thread";
import { useResolvedCount, useThreadStarterComments } from "@/web/comment/store/commentStore";
import { useDraft } from "@/web/comment/store/draftStore";
import { useSessionUser } from "@/web/common/hooks";
import { playgroundUsername } from "@/web/topic/diagramStore/store";
import { useOnPlayground } from "@/web/topic/diagramStore/topicHooks";
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
      {resolvedCount > 0 && (
        // extra space to the left feels a little awkward, but this can't be on the same line as the header
        // because the header can be within a group of tabs
        <div className="flex self-end">
          <Link
            component="button"
            variant="body2"
            onClick={(e) => {
              toggleShowResolvedComments(!showResolved);
              e.preventDefault(); // without this, page refreshes - not sure why, since component is a button, not an anchor
            }}
          >
            {showResolved ? "Hide resolved" : "Show resolved"}
          </Link>
        </div>
      )}

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
    </>
  );
};
