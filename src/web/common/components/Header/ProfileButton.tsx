import { IconButton, Tooltip } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { NavLink } from "@/web/common/components/NavLink";
import { ProfileIcon } from "@/web/common/components/ProfileIcon/ProfileIcon";
import { UserDrawer } from "@/web/common/components/UserDrawer/UserDrawer";
import { useSessionUser } from "@/web/common/hooks";

export const ProfileButton = () => {
  const { sessionUser, authUser } = useSessionUser();
  const { asPath } = useRouter();

  const [isInitialRender, setIsInitialRender] = useState(true);
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);

  useEffect(() => {
    setIsInitialRender(false);
  }, []);

  useEffect(() => {
    // close drawers after navigating
    setIsUserDrawerOpen(false);
  }, [asPath]);

  const isAuthed = authUser != null;
  const isLoggedIn = sessionUser != null;

  return (
    <>
      {!isLoggedIn && (
        <NavLink
          href={
            isAuthed
              ? "/choose-username"
              : isInitialRender // server-client mismatch if we use `returnTo` on initial render because server doesn't have access to asPath
                ? "/api/auth/login"
                : `/api/auth/login?returnTo=${encodeURIComponent(asPath)}`
          }
        >
          {isAuthed ? "Username" : "Log in"}
        </NavLink>
      )}

      {isLoggedIn && (
        <>
          <Tooltip title="My Profile">
            <IconButton onClick={() => setIsUserDrawerOpen(true)} className="size-8 p-0">
              <ProfileIcon username={sessionUser.username} />
            </IconButton>
          </Tooltip>
          <UserDrawer
            username={sessionUser.username}
            isUserDrawerOpen={isUserDrawerOpen}
            setIsUserDrawerOpen={setIsUserDrawerOpen}
          />
        </>
      )}
    </>
  );
};
