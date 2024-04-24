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
import { EditorContent, useEditor } from "@tiptap/react";

import { LinkMenu } from "./menus/LinkMenu";
import { TextMenu } from "./menus/TextMenu";

interface Props {
  text: string;
  onBlur: (html: string) => void;
}

// TODO: how is performance with 50 nodes with this editor vs textarea??
// TODO: should editability be conditional?
// TODO: just use mui tiptap for link stuff?

// TODO: max rows 3, scroll
// TODO: sanitize input? can html be dangerous when rendering here?
// TODO: increase node text length to allow long links? maybe 10000?
// TODO: verify that bubble menu goes beyond node size (maybe use portal from within viewport to keep it zooming and not cut off)
// TODO: add selected-text bubble form
// TODO: add hot link UI from template
/**
 * Most of the logic here is from the private repo https://github.com/ueberdosis/tiptap-templates,
 * which you can get free access to by signing up at https://tiptap.dev.
 */
export const RichTextEditor = ({ text, onBlur }: Props) => {
  const editor = useEditor({
    extensions: [
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
      Link.configure({ openOnClick: false }), // force users to see the link before clicking
    ],
    // TODO: update editor if text changes from outside component, e.g. via undo
    content: text,
    onBlur: ({ editor }) => {
      const html = editor.getHTML();
      console.log("blur:", html);
      onBlur(html);
    },
  });

  // ?: does this cause delay in loading?
  if (!editor) return null;

  // ?: need window.editor = editor?
  // ?: need Selection plugin?

  // ?: need outer menuContainerRef to give Menus an `appendTo`?
  return (
    <>
      {/* nopan: allow regular text input drag functionality without using reactflow's pan behavior */}
      <StyledEditorContent className="nopan" editor={editor} />
      {/* <LinkMenu editor={editor} appendTo={menuContainerRef} /> */}
      <LinkMenu editor={editor} />
      <TextMenu editor={editor} />
    </>
  );
};

const StyledEditorContent = styled(EditorContent)`
  width: 100%;

  & .ProseMirror {
    outline: none;
    text-align: center;
    font-size: 1rem;
    line-height: 1;
    /* font-family: inherit; */
    /* width: 100%; */
  }

  & p {
    margin: 0;
  }
`;
