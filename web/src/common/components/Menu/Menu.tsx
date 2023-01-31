// custom Menu component that closes the menu on click of any of its children

import { MenuItem, type MenuItemProps, Menu as MuiMenu } from "@mui/material";
import { Children, isValidElement } from "react";

import { deleteNode } from "../../../modules/topic/store/actions";
import { closeContextMenu } from "../../store/contextMenuActions";
import { useAnchorPosition, useContextMenuContext } from "../../store/contextMenuStore";

const addCloseOnClick = (closeMenu: () => void, children: React.ReactNode) => {
  return Children.map(children, (child) => {
    if (!isValidElement(child) || child.type !== MenuItem) {
      throw new Error("Menu children must be MenuItems");
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
  anchorEl: HTMLElement | undefined;
  isOpen: boolean;
  closeMenu: () => void;
  children: React.ReactNode;
}

export const Menu = ({ anchorEl, isOpen, closeMenu, children }: MenuProps) => {
  const menuItemsWithCloseOnClick = addCloseOnClick(closeMenu, children);

  return (
    <MuiMenu anchorEl={anchorEl} open={isOpen} onClose={closeMenu}>
      {menuItemsWithCloseOnClick}
    </MuiMenu>
  );
};

export const ContextMenu = () => {
  const anchorPosition = useAnchorPosition();
  const contextMenuContext = useContextMenuContext();

  if (contextMenuContext === undefined) return <></>;

  const isOpen = Boolean(anchorPosition);

  // create these based on what's set in the context
  const menuItems = (
    <MenuItem
      onClick={() => {
        deleteNode(contextMenuContext.node.id);
      }}
    >
      Delete node
    </MenuItem>
  );

  const menuItemsWithCloseOnClick = addCloseOnClick(closeContextMenu, menuItems);

  return (
    <MuiMenu
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition}
      open={isOpen}
      onClose={closeContextMenu}
    >
      {menuItemsWithCloseOnClick}
    </MuiMenu>
  );
};
