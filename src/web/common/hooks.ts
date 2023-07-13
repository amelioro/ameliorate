import { useState } from "react";

import { MenuPosition } from "./store/contextMenuStore";

export const useMenu = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>(undefined);

  const menuIsOpen = Boolean(anchorEl);

  const openMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const closeMenu = () => setAnchorEl(undefined);

  return [anchorEl, menuIsOpen, openMenu, closeMenu] as const;
};

export const useContextMenu = () => {
  const [anchorPosition, setAnchorPosition] = useState<MenuPosition | undefined>(undefined);

  const menuIsOpen = Boolean(anchorPosition);

  const openMenu = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault(); // prevent opening default context menu

    setAnchorPosition(
      anchorPosition === undefined ? { top: event.clientY, left: event.clientX } : undefined
    );
  };

  const closeMenu = () => setAnchorPosition(undefined);

  return [anchorPosition, menuIsOpen, openMenu, closeMenu] as const;
};
