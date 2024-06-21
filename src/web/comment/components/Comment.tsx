import styled from "@emotion/styled";
import { Check, MoreHoriz, Notifications, NotificationsOff, RemoveDone } from "@mui/icons-material";
import { Button, IconButton, MenuItem } from "@mui/material";
import { useEffect, useRef, useState } from "react";

import { isThreadStarterComment as checkIsThreadStarterComment } from "@/common/comment";
import { Draft } from "@/web/comment/components/Draft";
import { StoreComment, deleteComment, resolveComment } from "@/web/comment/store/commentStore";
import { deleteDraft, useDraft } from "@/web/comment/store/draftStore";
import { Menu } from "@/web/common/components/Menu/Menu";
import { ProfileIcon } from "@/web/common/components/ProfileIcon/ProfileIcon";
import { useSessionUser } from "@/web/common/hooks";
import { trpc } from "@/web/common/trpc";
import { useOnPlayground } from "@/web/topic/store/topicHooks";
import { useUserCanEditTopicData } from "@/web/topic/store/userHooks";

const getLinkToComment = (comment: StoreComment) => {
  const { origin, pathname } = window.location;

  const url = new URL(pathname, origin); // assumes we're copying the comment from its topic page
  url.searchParams.set("comment", comment.id);

  return url.href;
};

interface Props {
  comment: StoreComment;
}

export const Comment = ({ comment }: Props) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);
  const onPlayground = useOnPlayground();

  const isThreadStarterComment = checkIsThreadStarterComment(comment.parentType);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- if it's not a thread starter, the parent id is one
  const threadStarterCommentId = isThreadStarterComment ? comment.id : comment.parentId!;
  const willShowSubscribeBell = !onPlayground && !!sessionUser && isThreadStarterComment;

  const findSubscription = trpc.subscriptions.find.useQuery(
    { sourceId: threadStarterCommentId },
    { enabled: willShowSubscribeBell },
  );
  const subscribe = trpc.subscriptions.create.useMutation({
    onSuccess: () => findSubscription.refetch(),
  });
  const unsubscribe = trpc.subscriptions.delete.useMutation({
    onSuccess: () => findSubscription.refetch(),
  });

  const commentRef = useRef<HTMLDivElement | null>(null);
  const [moreAnchorEl, setMoreAnchorEl] = useState<null | HTMLElement>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);

  const draft = useDraft(comment.parentId, comment.parentType, comment.id);

  const userCanEditComment = onPlayground || comment.authorName === sessionUser?.username;
  const userCanDeleteComment = userCanEditTopicData || comment.authorName === sessionUser?.username;
  const showSubscribeBell = willShowSubscribeBell && findSubscription.isSuccess;
  const moreMenuOpen = Boolean(moreAnchorEl);

  useEffect(() => {
    const commentElement = commentRef.current;
    if (!commentElement) return;

    const urlParams = new URLSearchParams(window.location.search);
    const commentId = urlParams.get("comment");
    if (commentId === comment.id) {
      commentElement.focus();
    }
  }, [comment.id]);

  return (
    <BorderDiv
      ref={commentRef}
      className="relative space-y-2 break-words rounded focus:border focus:border-black"
      tabIndex={-1} // no value in tabbing to it besides showing border, so only set for the purpose of on-load highlighting
    >
      <HeaderDiv className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ProfileIcon username={comment.authorName} />
          <div className="flex flex-col">
            <span className="font-bold">{comment.authorName}</span>
            <span className="text-gray-400">
              {comment.createdAt.toLocaleString(undefined, {
                dateStyle: "short",
                timeStyle: "short",
              })}
              {comment.contentUpdatedAt > comment.createdAt ? " (edited)" : ""}
            </span>
          </div>
        </div>

        <div>
          {isThreadStarterComment &&
            userCanDeleteComment &&
            (!comment.resolved ? (
              <IconButton
                color="inherit"
                title="Resolve thread"
                aria-label="Resolve thread"
                onClick={() => resolveComment(comment.id, true)}
              >
                <Check />
              </IconButton>
            ) : (
              <IconButton
                color="inherit"
                title="Unresolve thread"
                aria-label="Unresolve thread"
                onClick={() => resolveComment(comment.id, false)}
              >
                <RemoveDone />
              </IconButton>
            ))}
          {showSubscribeBell && (
            <IconButton
              color="inherit"
              title={findSubscription.data === null ? "Subscribe" : "Unsubscribe"}
              aria-label={findSubscription.data === null ? "Subscribe" : "Unsubscribe"}
              onClick={
                findSubscription.data === null
                  ? () => subscribe.mutate({ sourceId: threadStarterCommentId })
                  : () => unsubscribe.mutate({ sourceId: threadStarterCommentId })
              }
            >
              {findSubscription.data === null ? <Notifications /> : <NotificationsOff />}
            </IconButton>
          )}
          <IconButton
            color="inherit"
            title="More"
            aria-label="More"
            onClick={(event) => setMoreAnchorEl(event.currentTarget)}
          >
            <MoreHoriz />
          </IconButton>
          <Menu
            anchorEl={moreAnchorEl}
            isOpen={moreMenuOpen}
            closeMenu={() => setMoreAnchorEl(null)}
          >
            {userCanEditComment && <MenuItem onClick={() => setEditing(true)}>Edit</MenuItem>}
            {userCanDeleteComment && (
              <MenuItem onClick={() => setShowConfirmDelete(true)}>Delete</MenuItem>
            )}
            <MenuItem onClick={() => void navigator.clipboard.writeText(getLinkToComment(comment))}>
              Copy link to comment
            </MenuItem>
          </Menu>
        </div>
      </HeaderDiv>

      {!editing ? (
        <p className="whitespace-pre">{comment.content}</p>
      ) : (
        <Draft
          authorName={comment.authorName}
          parentId={comment.parentId}
          parentType={comment.parentType}
          startingText={draft?.content ?? comment.content}
          commentId={comment.id}
          onDone={() => setEditing(false)}
        />
      )}

      {showConfirmDelete && (
        // jank "-top-2" to override the parent's space-y-2 that adds an equivalent margin
        <div className="absolute -top-2 left-0 flex size-full items-center justify-center bg-gray-100">
          <span className="m-2">Delete this {isThreadStarterComment ? "thread" : "comment"}?</span>
          <Button
            onClick={() => {
              setShowConfirmDelete(false);
              deleteComment(comment.id);
              deleteDraft(comment.parentId, comment.parentType, comment.id);
            }}
            color="error"
          >
            Delete
          </Button>
          <Button color="inherit" onClick={() => setShowConfirmDelete(false)}>
            Cancel
          </Button>
        </div>
      )}
    </BorderDiv>
  );
};

// just to be clear about the purpose of these, by applying a name - not sure if there's a better way to do this
const BorderDiv = styled.div``;
const HeaderDiv = styled.div``;
