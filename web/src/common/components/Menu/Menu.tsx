import { MenuItem, type MenuItemProps, Menu as MuiMenu } from "@mui/material";
import { Children, isValidElement } from "react";

interface MenuProps {
  anchorEl: HTMLElement | null;
  isOpen: boolean;
  closeMenu: () => void;
  children: React.ReactNode;
}

// custom Menu component that closes the menu on click of any of its children
export const Menu = ({ anchorEl, isOpen, closeMenu, children }: MenuProps) => {
  const menuItemsWithCloseOnClick = Children.map(children, (child) => {
    if (!isValidElement(child) || child.type !== MenuItem) {
      throw new Error("Menu children must be MenuItems");
    }

    const childProps = child.props as MenuItemProps;

    return {
      ...child,
      props: {
        ...childProps,
        onClick: (event: React.MouseEvent<HTMLLIElement>) => {
          closeMenu();
          if (childProps.onClick) childProps.onClick(event);
        },
      },
    };
  });

  return (
    <MuiMenu anchorEl={anchorEl} open={isOpen} onClose={closeMenu}>
      {menuItemsWithCloseOnClick}
    </MuiMenu>
  );
};
