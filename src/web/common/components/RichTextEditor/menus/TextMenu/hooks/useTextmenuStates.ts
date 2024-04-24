import { Editor } from "@tiptap/react";
import { useCallback } from "react";

import { isCustomNodeSelected, isTextSelected } from "../../../utils";

export const useTextmenuStates = (editor: Editor) => {
  const shouldShow = useCallback(() => {
    if (isCustomNodeSelected(editor)) {
      return false;
    }

    return isTextSelected({ editor });
  }, [editor]);

  return {
    isBold: editor.isActive("bold"),
    isItalic: editor.isActive("italic"),
    isStrike: editor.isActive("strike"),
    isUnderline: editor.isActive("underline"),
    isCode: editor.isActive("code"),
    shouldShow,
  };
};
