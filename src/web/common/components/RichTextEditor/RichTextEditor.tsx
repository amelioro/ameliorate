import styled from "@emotion/styled";
import { Bold } from "@tiptap/extension-bold";
import { Code } from "@tiptap/extension-code";
import { Document } from "@tiptap/extension-document";
import { History } from "@tiptap/extension-history";
import { Italic } from "@tiptap/extension-italic";
import { Link } from "@tiptap/extension-link";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Text } from "@tiptap/extension-text";
import { Underline } from "@tiptap/extension-underline";
import { useEditor } from "@tiptap/react";
// import { RichTextEditorProvider, RichTextField, RichTextReadOnly } from "mui-tiptap";
import {
  LinkBubbleMenu,
  LinkBubbleMenuHandler,
  RichTextEditorProvider,
  RichTextField,
} from "mui-tiptap";
import { memo, useEffect } from "react";

import { TextBubbleMenu } from "./TextBubbleMenu";

// See https://github.com/sjdemartini/mui-tiptap/blob/9cebbc9738adb954c636f40c896c6fb80fdce5ba/src/demo/useExtensions.ts#L50-L68
const CustomLinkExtension = Link.extend({
  inclusive: false,
});

const extensions = [
  // required
  Document,
  Paragraph,
  Text,
  // extensions
  History,
  Placeholder.configure({ placeholder: "Enter text..." }),
  // marks
  Bold,
  Code,
  Italic,
  Underline,
  // TODO?: way to view link before opening when editor is readonly? could make pointer events none until node is selected
  CustomLinkExtension.configure({ openOnClick: false }),
  LinkBubbleMenuHandler,
];

interface Props {
  text: string;
  editable: boolean;
  onBlur: (html: string) => void;
}

// const EditableEditor = ({ text, onBlur }: Omit<Props, "editable">) => {
const EditableEditor = ({ text, editable, onBlur }: Props) => {
  const editor = useEditor({
    extensions,
    content: text,
    onBlur: ({ editor }) => {
      // TODO: safe to save html, or should use markdown?
      const html = editor.getHTML();
      console.log("blur:", html);
      onBlur(html);
    },
    // TODO?: too unperformant to leave editable all the time? switching to read-only currently causes node to animate to size 0 for a moment
    editable,
  });

  // useEffect(() => {
  //   if (!editor) return;

  //   // update editor if text changes from outside component, e.g. via undo
  //   if (text !== editor.getHTML()) editor.commands.setContent(text);
  // }, [editor, text]);

  // useEffect(() => {
  //   if (!editor) return;

  //   if (editor.isEditable !== editable) editor.setEditable(editable);
  // }, [editable, editor]);

  // ?: does this cause delay in loading?
  if (!editor) return null;

  // TODO: shouldn't need these `npm uninstall @tiptap/extension-heading @tiptap/extension-image @tiptap/extension-table`

  return (
    <RichTextEditorProvider editor={editor}>
      {/* nopan: allow regular text input drag functionality without using reactflow's pan behavior */}
      <RichTextField className="nopan" />

      <LinkBubbleMenu />
      <TextBubbleMenu editor={editor} />
    </RichTextEditorProvider>
  );
};

// TODO(bug): node initially renders with text, then without text, then with text again
// TODO: also use rich text editor for topic description, node notes
// TODO: disable all rich text functionality if node.type !== source node
// TODO?: reduce re-renders by keeping node always editable?

const RichTextEditorBase = ({ text, editable, onBlur }: Props) => {
  return (
    <RichTextEditorContainer>
      {/* split so that we can avoid extra work when not editable */}
      {/* {editable ? (
        <EditableEditor text={text} onBlur={onBlur} />
      ) : (
        <RichTextReadOnly content={text} extensions={extensions} />
      )} */}
      <EditableEditor text={text} editable={editable} onBlur={onBlur} />
    </RichTextEditorContainer>
  );
};

export const RichTextEditor = memo(RichTextEditorBase);

// TODO?: TextareaAutosize allowed using line-height 1 because it used overflow: hidden until text overflowed,
// but regular div doesn't have that behavior, so line-height 1 always show scrollbar https://stackoverflow.com/a/16444133/8409296.
// Ideally we'd use line-height 1 because that saves us 9 px per node! But not sure how to do that without always showing scrollbar.
const lineHeight = 1.2;
const maxRows = 3;

const RichTextEditorContainer = styled.div`
  width: 100%;

  & div.MuiTiptap-FieldContainer-root {
    padding: 0;
  }

  & .MuiTiptap-FieldContainer-notchedOutline {
    border: 0;
  }

  & div.MuiTiptap-RichTextContent-root {
    padding: 0;
  }

  & .ProseMirror {
    text-align: center;
    font-size: 1rem;
    line-height: ${lineHeight};
    max-height: calc(1rem * ${lineHeight} * ${maxRows});
    overflow: auto;
    letter-spacing: normal; // spaces don't take up space if they're at the end of the line
    cursor: auto;
  }
`;
