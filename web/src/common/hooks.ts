import { useState } from "react";

export const useMenu = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const menuIsOpen = Boolean(anchorEl);

  const openMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  return [anchorEl, menuIsOpen, openMenu, closeMenu] as const;
};
