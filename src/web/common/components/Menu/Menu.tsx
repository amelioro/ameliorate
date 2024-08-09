// custom Menu component that closes the menu on click of any of its children

import { MenuItem, type MenuItemProps, Menu as MuiMenu } from "@mui/material";
import { Children, isValidElement } from "react";

export const addCloseOnClick = (closeMenu: () => void, children: React.ReactNode) => {
  return Children.map(children, (child) => {
    if (!isValidElement(child) || child.type !== MenuItem) {
      return child; // don't add on close if not a menu item, but also don't error - could receive fragment or false if conditionally building menu items
    }

    const childProps = child.props as MenuItemProps;

    return {
      ...child,
      props: {
        ...childProps,
        // TODO: is there a way to prevent double clicks? can error e.g. if deleting a node twice
        onClick: (event: React.MouseEvent<HTMLLIElement>) => {
          closeMenu();
          if (childProps.onClick) childProps.onClick(event);
        },
      },
    };
  });
};

interface MenuProps {
  anchorEl: HTMLElement | null;
  isOpen: boolean;
  closeMenu: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Menu = ({ anchorEl, isOpen, closeMenu, children, className }: MenuProps) => {
  const menuItemsWithCloseOnClick = addCloseOnClick(closeMenu, children);

  return (
    <MuiMenu
      PopoverClasses={{ paper: className }}
      anchorEl={anchorEl}
      open={isOpen}
      onClose={closeMenu}
    >
      {menuItemsWithCloseOnClick}
    </MuiMenu>
  );
};
