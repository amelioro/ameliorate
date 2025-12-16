import { Comment } from "@/web/comment/components/Comment";
import { Draft } from "@/web/comment/components/Draft";
import { StoreComment, useThreadChildrenComments } from "@/web/comment/store/commentStore";
import { useDraft } from "@/web/comment/store/draftStore";

interface Props {
  myUsername: string | undefined;
  threadStarterComment: StoreComment;
}

export const Thread = ({ myUsername, threadStarterComment }: Props) => {
  const threadChildrenComments = useThreadChildrenComments(threadStarterComment.id);
  const draft = useDraft(threadStarterComment.id, "comment");

  return (
    <div className="space-y-3 rounded-sm border p-3 shadow-sm">
      <Comment comment={threadStarterComment} />

      {threadChildrenComments.map((comment) => (
        <Comment key={comment.id} comment={comment} />
      ))}

      {myUsername && (
        <Draft
          authorName={myUsername}
          parentId={threadStarterComment.id}
          parentType="comment"
          startingText={draft?.content}
        />
      )}
    </div>
  );
};
