import { Menu } from "@mui/icons-material";
import { AppBar, IconButton, Link as MuiLink, Toolbar, Tooltip, useTheme } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { Link } from "@/web/common/components/Link";
import { NavLink } from "@/web/common/components/NavLink";
import { ProfileIcon } from "@/web/common/components/ProfileIcon/ProfileIcon";
import { SiteDrawer } from "@/web/common/components/SiteDrawer/SiteDrawer";
import { UserDrawer } from "@/web/common/components/UserDrawer/UserDrawer";
import { useSessionUser } from "@/web/common/hooks";
import { discordInvite, githubRepo } from "@/web/common/urls";
import favicon from "~/public/favicon.png";

export const Header = () => {
  const theme = useTheme();

  // How to always populate user from the server if logged in? should be possible https://auth0.github.io/nextjs-auth0/types/client_use_user.UserProviderProps.html
  // Without doing so, there's a brief flicker of "Log in" before it changes to "Log out" on the client
  // Potentially use getInitialProps in _app.tsx because that's for all pages but it seems like that'd
  // remove automatic usage of static pages https://nextjs.org/docs/pages/api-reference/functions/get-initial-props
  const { sessionUser, authUser } = useSessionUser();
  const { asPath } = useRouter();

  const [isInitialRender, setIsInitialRender] = useState(true);
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const [isSiteDrawerOpen, setIsSiteDrawerOpen] = useState(false);

  useEffect(() => {
    setIsInitialRender(false);
  }, []);

  useEffect(() => {
    // close drawers after navigating
    setIsUserDrawerOpen(false);
    setIsSiteDrawerOpen(false);
  }, [asPath]);

  const isAuthed = authUser != null;
  const isLoggedIn = sessionUser != null;

  return (
    <AppBar position="sticky" className="border-b bg-gray-50 shadow-none">
      <Toolbar variant="dense">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-4">
            <IconButton onClick={() => setIsSiteDrawerOpen(true)} className="block p-0 sm:hidden">
              <Menu />
            </IconButton>
            <SiteDrawer
              username={sessionUser?.username}
              isSiteDrawerOpen={isSiteDrawerOpen}
              setIsSiteDrawerOpen={setIsSiteDrawerOpen}
            />

            <div className="relative flex">
              <Link href="/" className="flex items-center gap-2" underline="none">
                <Image src={favicon} height={32} width={32} alt="home" />
                <span className="text-xl font-medium text-black">Ameliorate</span>
              </Link>
              <MuiLink
                href="https://ameliorate.app/docs/release-status"
                variant="caption"
                underline="hover"
                className="absolute -top-0.5 left-0.5 rotate-12 text-text-primary"
              >
                Alpha
              </MuiLink>
            </div>

            <NavLink href="/playground" className="hidden sm:block">
              Playground
            </NavLink>
            {sessionUser && (
              <NavLink href={`/${sessionUser.username}`} className="hidden sm:block">
                My Topics
              </NavLink>
            )}
          </div>

          <div className="flex items-center gap-4">
            <NavLink href="https://ameliorate.app/docs" target="_blank" data-tour="docs">
              Docs
            </NavLink>
            <Link href={discordInvite} target="_blank" className="hidden sm:flex">
              <Image
                src={`/${theme.palette.mode}/Discord-Mark.png`}
                height={24}
                width={32}
                alt="discord link"
              />
            </Link>
            <Link href={githubRepo} target="_blank" className="hidden sm:flex">
              <Image
                src={`/${theme.palette.mode}/GitHub-Mark.png`}
                height={32}
                width={32}
                alt="github link"
              />
            </Link>

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
          </div>
        </div>
      </Toolbar>
    </AppBar>
  );
};
