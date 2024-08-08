import { MenuItem, type MenuItemProps } from "@mui/material";

import { closeContextMenu } from "@/web/common/store/contextMenuActions";

export const ContextMenuItem = (props: MenuItemProps) => {
  return <CloseOnClickMenuItem closeMenu={closeContextMenu} {...props} />;
};

interface Props extends MenuItemProps {
  closeMenu: () => void;
}

export const CloseOnClickMenuItem = ({ closeMenu, ...props }: Props) => {
  return (
    <MenuItem
      {...props}
      onClick={(event) => {
        closeMenu();
        if (props.onClick) props.onClick(event);
      }}
    />
  );
};
