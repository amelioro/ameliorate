import { Button, TextField } from "@mui/material";
import { useRef, useState } from "react";

import { CommentParentType } from "../../../common/comment";
import { upsertComment } from "../store/commentStore";
import { deleteDraft, setDraft } from "../store/draftStore";

interface Props {
  authorName: string;
  parentId: string | null;
  parentType: CommentParentType;
  startingText?: string;
  /**
   * If present, the draft is updating an existing comment
   */
  commentId?: string;
  onDone?: () => void; // needed for canceling edits, so draft can stop displaying
}

export const Draft = ({
  authorName,
  parentId,
  parentType,
  startingText,
  commentId,
  onDone,
}: Props) => {
  const [draftHasText, setDraftHasText] = useState(startingText && startingText.length > 0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const creating = commentId === undefined;
  const replying = parentType === "comment";

  const [showActionButtons, setShowActionButtons] = useState(!creating);

  const completeAction = () => {
    deleteDraft(parentId, parentType, commentId);
    // eslint-disable-next-line functional/immutable-data
    if (inputRef.current) inputRef.current.value = "";
    setShowActionButtons(false);
    if (onDone) onDone();
  };

  return (
    <div className="my-1">
      <TextField
        inputRef={inputRef}
        size="small"
        inputProps={{ className: "text-sm" }}
        placeholder={
          replying ? "Reply to this thread..." : "Write a comment, starting a new thread..."
        }
        defaultValue={startingText}
        multiline
        fullWidth
        maxRows={10}
        onChange={(event) => {
          if (event.target.value.length > 0 && !draftHasText) setDraftHasText(true);
          else if (event.target.value.length === 0 && draftHasText) setDraftHasText(false);
        }}
        onBlur={(event) => setDraft(parentId, parentType, event.target.value, commentId)}
        onFocus={() => setShowActionButtons(true)}
      />

      {showActionButtons && (
        <div className="mt-2 flex justify-end space-x-2">
          <Button onClick={() => completeAction()}>Cancel</Button>

          <Button
            onClick={() => {
              if (!inputRef.current?.value) throw new Error("tried sending comment without text");
              upsertComment(authorName, parentId, parentType, inputRef.current.value, commentId);
              completeAction();
            }}
            variant="contained"
            disabled={!draftHasText}
          >
            {creating ? "Send" : "Save"}
          </Button>
        </div>
      )}
    </div>
  );
};
