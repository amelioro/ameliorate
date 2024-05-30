import React from "react";

import { Context, useContextMenuStore } from "@/web/common/store/contextMenuStore";

export const openContextMenu = (event: React.MouseEvent, context: Context) => {
  event.preventDefault(); // prevent opening default context menu
  // Prevent overriding context if a parent element also triggers a context menu.
  // e.g. clicking a node would add node to context but then diagram click would trigger and
  // overwrite with empty context.
  event.stopPropagation();

  useContextMenuStore.setState((state) => {
    return {
      anchorPosition:
        // Setting back to undefined to close the menu when right clicking with an already-open menu.
        // Chrome's current default is to open another menu, but unfortunately Mui's Menu is rendered
        // with a backdrop, so new right-clicks would have the same context as the previous one
        // (e.g. right click on a node, then right click on the background, the menu would still have
        // the "delete node" menu item).
        state.anchorPosition === undefined
          ? { top: event.clientY, left: event.clientX }
          : undefined,
      context: context,
    };
  });
};

export const closeContextMenu = () => {
  useContextMenuStore.setState({ anchorPosition: undefined, context: undefined });
};
