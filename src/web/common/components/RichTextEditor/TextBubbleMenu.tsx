import { isTextSelection } from "@tiptap/core";
import { Link } from "@tiptap/extension-link";
import { Editor } from "@tiptap/react";
import { ControlledBubbleMenu, MenuButtonEditLink, MenuControlsContainer } from "mui-tiptap";

// most of this
const isCustomNodeSelected = (editor: Editor) => {
  const customNodes = [Link.name];

  return customNodes.some((type) => editor.isActive(type));
};

const isTextSelected = (editor: Editor) => {
  const {
    state: {
      doc,
      selection,
      selection: { empty, from, to },
    },
  } = editor;

  // Sometime check for `empty` is not enough.
  // Doubleclick an empty paragraph returns a node size of 2.
  // So we check also for an empty text size.
  const isEmptyTextBlock = !doc.textBetween(from, to).length && isTextSelection(selection);

  if (empty || isEmptyTextBlock || !editor.isEditable) {
    return false;
  }

  return true;
};

interface Props {
  editor: Editor;
}

/**
 * Most of the logic here is from merging logic from `TextMenu` in the private repo https://github.com/ueberdosis/tiptap-templates,
 * which you can get free access to by signing up at https://tiptap.dev,
 * with MuiTipTap's components.
 */
export const TextBubbleMenu = ({ editor }: Props) => {
  const open = !isCustomNodeSelected(editor) && isTextSelected(editor);

  return (
    <ControlledBubbleMenu editor={editor} open={open}>
      <MenuControlsContainer>
        <MenuButtonEditLink />
      </MenuControlsContainer>
    </ControlledBubbleMenu>
  );
};
