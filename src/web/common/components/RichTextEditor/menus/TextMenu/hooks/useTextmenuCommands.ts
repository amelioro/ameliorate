import { Editor } from "@tiptap/react";
import { useCallback } from "react";

export const useTextmenuCommands = (editor: Editor) => {
  const onBold = useCallback(() => editor.chain().focus().toggleBold().run(), [editor]);
  const onItalic = useCallback(() => editor.chain().focus().toggleItalic().run(), [editor]);
  const onUnderline = useCallback(() => editor.chain().focus().toggleUnderline().run(), [editor]);
  const onCode = useCallback(() => editor.chain().focus().toggleCode().run(), [editor]);

  const onLink = useCallback(
    (url: string) => editor.chain().focus().setLink({ href: url, target: "_blank" }).run(),
    [editor]
  );

  return {
    onBold,
    onItalic,
    onUnderline,
    onCode,
    onLink,
  };
};
