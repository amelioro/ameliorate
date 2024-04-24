import { BubbleMenu, Editor } from "@tiptap/react";
import { memo } from "react";

import { Icon } from "../../ui/Icon";
import { Toolbar } from "../../ui/Toolbar";
import { EditLinkPopover } from "./components/EditLinkPopover";
import { useTextmenuCommands } from "./hooks/useTextmenuCommands";
import { useTextmenuStates } from "./hooks/useTextmenuStates";

// We memorize the button so each button is not rerendered
// on every editor state change
const MemoButton = memo(Toolbar.Button);

export interface TextMenuProps {
  editor: Editor;
}

export const TextMenu = ({ editor }: TextMenuProps) => {
  const commands = useTextmenuCommands(editor);
  const states = useTextmenuStates(editor);

  return (
    <BubbleMenu
      tippyOptions={{ popperOptions: { placement: "top-start" } }}
      editor={editor}
      pluginKey="textMenu"
      shouldShow={states.shouldShow}
      updateDelay={100}
    >
      <Toolbar.Wrapper>
        <Toolbar.Divider />
        <MemoButton
          tooltip="Bold"
          tooltipShortcut={["Mod", "B"]}
          onClick={commands.onBold}
          active={states.isBold}
        >
          <Icon name="Bold" />
        </MemoButton>
        <MemoButton
          tooltip="Italic"
          tooltipShortcut={["Mod", "I"]}
          onClick={commands.onItalic}
          active={states.isItalic}
        >
          <Icon name="Italic" />
        </MemoButton>
        <MemoButton
          tooltip="Underline"
          tooltipShortcut={["Mod", "U"]}
          onClick={commands.onUnderline}
          active={states.isUnderline}
        >
          <Icon name="Underline" />
        </MemoButton>
        <MemoButton
          tooltip="Code"
          tooltipShortcut={["Mod", "E"]}
          onClick={commands.onCode}
          active={states.isCode}
        >
          <Icon name="Code" />
        </MemoButton>
        <EditLinkPopover onSetLink={commands.onLink} />
      </Toolbar.Wrapper>
    </BubbleMenu>
  );
};
