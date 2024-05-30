import { MenuItem, type MenuItemProps } from "@mui/material";

import { closeContextMenu } from "@/web/common/store/contextMenuActions";

/**
 * Context menu items have their own components, which makes it harder to enhance their onClick
 * (by passing the component) to close the menu. Wrapping the item itself seems easier in this case.
 */
export const CloseOnClickMenuItem = (props: MenuItemProps) => {
  return (
    <MenuItem
      {...props}
      onClick={(event) => {
        closeContextMenu();
        if (props.onClick) props.onClick(event);
      }}
    />
  );
};
