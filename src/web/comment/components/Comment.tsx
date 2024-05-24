import styled from "@emotion/styled";
import { MoreHoriz } from "@mui/icons-material";
import { Button, IconButton, MenuItem } from "@mui/material";
import { useState } from "react";

import { isRootComment } from "../../../common/comment";
import { Menu } from "../../common/components/Menu/Menu";
import { ProfileIcon } from "../../common/components/ProfileIcon/ProfileIcon";
import { StoreComment, deleteComment } from "../store/commentStore";
import { deleteDraft, useDraft } from "../store/draftStore";
import { Draft } from "./Draft";

interface Props {
  comment: StoreComment;
}

export const Comment = ({ comment }: Props) => {
  const [moreAnchorEl, setMoreAnchorEl] = useState<null | HTMLElement>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);

  const draft = useDraft(comment.parentId, comment.parentType, comment.id);

  const moreMenuOpen = Boolean(moreAnchorEl);

  return (
    <BorderDiv className="relative space-y-2 break-words">
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
              {comment.updatedAt > comment.createdAt ? " (edited)" : ""}
            </span>
          </div>
        </div>

        <div>
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
            <MenuItem onClick={() => setEditing(true)}>Edit</MenuItem>
            <MenuItem onClick={() => setShowConfirmDelete(true)}>Delete</MenuItem>
          </Menu>
        </div>
      </HeaderDiv>

      {!editing ? (
        <p>{comment.content}</p>
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
          <span className="m-2">
            Delete this {isRootComment(comment.parentType) ? "thread" : "comment"}?
          </span>
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
          <Button onClick={() => setShowConfirmDelete(false)}>Cancel</Button>
        </div>
      )}
    </BorderDiv>
  );
};

// just to be clear about the purpose of these, by applying a name - not sure if there's a better way to do this
const BorderDiv = styled.div``;
const HeaderDiv = styled.div``;
