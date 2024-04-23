import styled from "@emotion/styled";
import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";

import { editorTheme } from "./editorTheme";

const onError = (error: Error) => {
  throw error;
};

const initialConfig = {
  namespace: "MyEditor",
  nodes: [CodeNode, HeadingNode, HorizontalRuleNode, LinkNode, ListNode, ListItemNode, QuoteNode],
  theme: editorTheme,
  onError,
};

// notes:
// converting to markdown https://github.com/facebook/lexical/blob/main/packages/lexical-playground/src/plugins/ActionsPlugin/index.tsx#L139

export const RichTextEditor = () => {
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <ContainerDiv>
        <InnerDiv>
          <RichTextPlugin
            // nopan: allow regular text input drag functionality without using reactflow's pan behavior
            contentEditable={<StyledContentEditable className="nopan" />}
            placeholder={<PlaceholderDiv>Enter text...</PlaceholderDiv>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          {/* this just converts **item** to a bolded item */}
          {/* <MarkdownShortcutPlugin /> */}
          <AutoFocusPlugin />
        </InnerDiv>
      </ContainerDiv>
    </LexicalComposer>
  );
};

// styles
// many of these copied from stackblitz example https://lexical.dev/docs/getting-started/react#adding-ui-to-control-text-formatting
// but removed ones that weren't necessary at this time
const ContainerDiv = styled.div`
  /* margin: auto; */
  /* border-radius: 2px; */
  width: 100%;
  /* color: #000; */
  position: relative;
  /* line-height: 1; */
  /* font-weight: 400; */
  /* text-align: left; */
  /* border-top-left-radius: 10px;
  border-top-right-radius: 10px; */

  & .editor-text-bold {
    font-weight: bold;
  }

  & .editor-text-italic {
    font-style: italic;
  }

  & .editor-text-underline {
    text-decoration: underline;
  }

  & .editor-text-strikethrough {
    text-decoration: line-through;
  }

  & .editor-text-underlineStrikethrough {
    text-decoration: underline line-through;
  }

  & .editor-text-code {
    background-color: rgb(240, 242, 245);
    padding: 1px 0.25rem;
    font-family: Menlo, Consolas, Monaco, monospace;
    font-size: 94%;
  }

  & .editor-link {
    color: rgb(33, 111, 219);
    text-decoration: none;
  }

  & .editor-paragraph {
    margin: 0;
    margin-bottom: 8px;
    position: relative;
  }

  & .editor-paragraph:last-child {
    margin-bottom: 0;
  }

  & .editor-heading-h1 {
    font-size: 24px;
    color: rgb(5, 5, 5);
    font-weight: 400;
    margin: 0;
    margin-bottom: 12px;
    padding: 0;
  }

  & .editor-heading-h2 {
    font-size: 15px;
    color: rgb(101, 103, 107);
    font-weight: 700;
    margin: 0;
    margin-top: 10px;
    padding: 0;
    text-transform: uppercase;
  }

  & .editor-quote {
    margin: 0;
    margin-left: 20px;
    font-size: 15px;
    color: rgb(101, 103, 107);
    border-left-color: rgb(206, 208, 212);
    border-left-width: 4px;
    border-left-style: solid;
    padding-left: 16px;
  }

  & .editor-list-ol {
    padding: 0;
    margin: 0;
    margin-left: 16px;
  }

  & .editor-list-ul {
    padding: 0;
    margin: 0;
    margin-left: 16px;
  }

  & .editor-listitem {
    margin: 8px 32px 8px 32px;
  }

  & .editor-nested-listitem {
    list-style-type: none;
  }

  & pre::-webkit-scrollbar {
    background: transparent;
    width: 10px;
  }

  & pre::-webkit-scrollbar-thumb {
    background: #999;
  }
`;

const InnerDiv = styled.div`
  /* background: #fff; */
  position: relative;
`;

const StyledContentEditable = styled(ContentEditable)`
  /* min-height: 150px; */
  position: relative;
  padding: 0;
  resize: none;
  outline: none;
  text-align: center;
  font-size: 1rem;
  // TextareaAutosize allowed using line-height 1 because it used overflow: hidden until text overflowed
  // but ContentEditable doesn't have that behavior, so line-height 1 always show scrollbar https://stackoverflow.com/a/16444133/8409296
  // Ideally we'd use line-height 1 because that saves us 9 px per node! But not sure how to do that without always showing scrollbar
  line-height: normal;
  max-height: 57px;
  /* line-height: 1; */
  /* max-height: 48px; */
  overflow-y: auto;
  font-family: inherit;
  cursor: auto;
`;

const PlaceholderDiv = styled.div`
  color: #999;
  overflow: hidden;
  position: absolute;
  top: 0;
  width: 100%;
  font-size: 1rem;
  line-height: normal;
  text-align: center;
  user-select: none;
  display: inline-block;
  pointer-events: none;
`;
