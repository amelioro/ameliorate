import { z } from "zod";

import { topicSchema } from "@/common/topic";
import { userSchema } from "@/common/user";

export const commentParentTypes = ["topic", "node", "edge", "comment"] as const;
export const zCommentParentTypes = z.enum(commentParentTypes);
export type CommentParentType = z.infer<typeof zCommentParentTypes>;

export const commentSchema = z
  .object({
    id: z.string(),
    authorName: userSchema.shape.username,
    topicId: topicSchema.shape.id,
    parentId: z.string().nullable(),
    parentType: zCommentParentTypes,
    content: z.string().max(10000),
    resolved: z.boolean().nullable(),
    createdAt: z.date(),
    contentUpdatedAt: z.date(),
  })
  .refine((comment) => {
    if (comment.parentType === "topic") return comment.parentId === null;
    return comment.parentId !== null;
  }, "only non-topic comments should have a parentId - topic comments will rely on topicId.")
  .refine((comment) => {
    if (!isRootComment(comment.parentType)) return comment.resolved === null;
    return typeof comment.resolved === "boolean";
  }, "only root comments can be resolved or unresolved.");

export type Comment = z.infer<typeof commentSchema>;

/**
 * "root" means that the comment starts a thread, i.e. is not a reply to another comment
 */
export const isRootComment = (parentType: CommentParentType) => parentType !== "comment";

export const userCanDeleteComment = (
  username: string,
  userCanEditTopic: boolean,
  commentToDelete: Comment,
  otherCommentsBeingDeleted: Comment[]
) => {
  if (commentToDelete.authorName === username || userCanEditTopic) return true;

  const deletingAsResultOfPermittedThreadDeletion =
    commentToDelete.parentType === "comment" &&
    otherCommentsBeingDeleted.some(
      (otherComment) =>
        otherComment.id === commentToDelete.parentId && otherComment.authorName === username
    );

  return deletingAsResultOfPermittedThreadDeletion;
};
