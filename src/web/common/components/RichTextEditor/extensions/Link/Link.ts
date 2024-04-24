import { mergeAttributes } from "@tiptap/core";
import TiptapLink from "@tiptap/extension-link";
import { Plugin } from "@tiptap/pm/state";
import { EditorView } from "@tiptap/pm/view";

export const Link = TiptapLink.extend({
  inclusive: false,

  parseHTML() {
    return [{ tag: 'a[href]:not([data-type="button"]):not([href *= "javascript:" i])' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "a",
      // eslint-disable-next-line functional/no-this-expressions
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { class: "link" }),
      0,
    ];
  },

  addProseMirrorPlugins() {
    // eslint-disable-next-line functional/no-this-expressions
    const { editor } = this;

    return [
      // eslint-disable-next-line functional/no-this-expressions
      ...(this.parent?.() ?? []),
      new Plugin({
        props: {
          handleKeyDown: (_view: EditorView, event: KeyboardEvent) => {
            const { selection } = editor.state;

            if (event.key === "Escape" && !selection.empty) {
              editor.commands.focus(selection.to, { scrollIntoView: false });
            }

            return false;
          },
        },
      }),
    ];
  },
});

export default Link;
