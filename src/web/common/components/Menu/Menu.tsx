// custom Menu component that closes the menu on click of any of its children

import {
  MenuItem,
  type MenuItemProps,
  Menu as MuiMenu,
  MenuProps as MuiMenuProps,
} from "@mui/material";
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

interface MenuProps extends MuiMenuProps {
  onClose: () => void;
  closeOnClick?: boolean;
  openDirection?: "top" | "bottom";
}

export const Menu = ({
  onClose,
  closeOnClick = true,
  openDirection = "bottom",
  ...muiProps
}: MenuProps) => {
  const { children, className, ...rest } = muiProps;

  const menuItems = closeOnClick ? addCloseOnClick(onClose, children) : children;

  return (
    <MuiMenu
      PopoverClasses={{ paper: className }}
      onClose={onClose}
      anchorOrigin={{ vertical: openDirection === "top" ? "top" : "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: openDirection === "top" ? "bottom" : "top", horizontal: "left" }}
      {...rest}
    >
      {menuItems}
    </MuiMenu>
  );
};
