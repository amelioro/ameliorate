import { useUser as useAuthUser } from "@auth0/nextjs-auth0/client";
import { useState } from "react";

import { MenuPosition } from "./store/contextMenuStore";
import { trpc } from "./trpc";

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

export const useSessionUser = () => {
  const { user: authUser } = useAuthUser();

  const findUserByAuthId = trpc.user.findByAuthId.useQuery(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain -- enabled will ensure it only runs when not null
    { authId: authUser?.sub! },
    { enabled: !!authUser?.sub, staleTime: Infinity }
  );

  // ensure we return null if the user is not authenticated (i.e. after logout, don't continue using the cached user)
  const sessionUser = authUser ? findUserByAuthId.data : null;

  return {
    sessionUser: sessionUser,
    authUser: authUser,
    isLoading: findUserByAuthId.isFetching && findUserByAuthId.isLoading, // return isLoading: false if not fetching, e.g. if user isn't authenticated
  };
};
