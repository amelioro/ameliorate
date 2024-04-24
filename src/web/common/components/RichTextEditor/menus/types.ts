import { Editor } from "@tiptap/react";
import React from "react";

export interface MenuProps {
  editor: Editor;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appendTo?: React.RefObject<any>;
  shouldHide?: boolean;
}
