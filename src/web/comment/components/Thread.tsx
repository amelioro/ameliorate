import { StoreComment, useThreadChildrenComments } from "../store/commentStore";
import { useDraft } from "../store/draftStore";
import { Comment } from "./Comment";
import { Draft } from "./Draft";

interface Props {
  myUsername: string | undefined;
  rootComment: StoreComment;
}

export const Thread = ({ myUsername, rootComment }: Props) => {
  const threadChildrenComments = useThreadChildrenComments(rootComment.id);
  const draft = useDraft(rootComment.id, "comment");

  return (
    <div className="space-y-3 rounded border p-3 shadow">
      <Comment comment={rootComment} />

      {threadChildrenComments.map((comment) => (
        <Comment key={comment.id} comment={comment} />
      ))}

      {myUsername && (
        <Draft
          authorName={myUsername}
          parentId={rootComment.id}
          parentType="comment"
          startingText={draft?.content}
        />
      )}
    </div>
  );
};
