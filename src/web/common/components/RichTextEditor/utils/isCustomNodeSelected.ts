import { Editor } from "@tiptap/react";

import { Link } from "../extensions/Link";

export const isCustomNodeSelected = (editor: Editor) => {
  const customNodes = [Link.name];

  return customNodes.some((type) => editor.isActive(type));
};

export default isCustomNodeSelected;
