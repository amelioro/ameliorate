import { BubbleMenu as BaseBubbleMenu } from "@tiptap/react";
import React, { useCallback, useState } from "react";

import { LinkEditorPanel } from "../../panels";
import { LinkPreviewPanel } from "../../panels/LinkPreviewPanel";
import { MenuProps } from "../types";

export const LinkMenu = ({ editor, appendTo }: MenuProps): JSX.Element => {
  const [showEdit, setShowEdit] = useState(false);

  const shouldShow = useCallback(() => {
    const isActive = editor.isActive("link");
    return isActive;
  }, [editor]);

  const { href: link } = editor.getAttributes("link") as { href: string };

  const handleEdit = useCallback(() => {
    setShowEdit(true);
  }, []);

  const onSetLink = useCallback(
    (url: string) => {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url, target: "_blank" }).run();
      setShowEdit(false);
    },
    [editor]
  );

  const onUnsetLink = useCallback(() => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setShowEdit(false);
    return null;
  }, [editor]);

  return (
    <BaseBubbleMenu
      editor={editor}
      pluginKey="textMenu"
      shouldShow={shouldShow}
      updateDelay={0}
      tippyOptions={{
        popperOptions: {
          modifiers: [{ name: "flip", enabled: false }],
        },
        appendTo: () => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return appendTo?.current;
        },
        onHidden: () => {
          setShowEdit(false);
        },
      }}
    >
      {showEdit ? (
        <LinkEditorPanel initialUrl={link} onSetLink={onSetLink} />
      ) : (
        <LinkPreviewPanel url={link} onClear={onUnsetLink} onEdit={handleEdit} />
      )}
    </BaseBubbleMenu>
  );
};

export default LinkMenu;
