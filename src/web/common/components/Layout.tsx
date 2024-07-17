import { Menu } from "@mui/icons-material";
import {
  AppBar,
  Box,
  IconButton,
  Link as MuiLink,
  Toolbar,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { NextPage } from "next";
import { Roboto } from "next/font/google";
import Image from "next/image";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";

import { Link } from "@/web/common/components/Link";
import { NavLink } from "@/web/common/components/NavLink";
import { ProfileIcon } from "@/web/common/components/ProfileIcon/ProfileIcon";
import { SiteDrawer } from "@/web/common/components/SiteDrawer/SiteDrawer";
import { UserDrawer } from "@/web/common/components/UserDrawer/UserDrawer";
import { useSessionUser } from "@/web/common/hooks";
import { discordInvite, githubRepo } from "@/web/common/urls";
import favicon from "~/public/favicon.png";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});

interface LayoutProps {
  children: ReactNode;
}

const Layout: NextPage<LayoutProps> = ({ children }) => {
  const theme = useTheme();

  // How to always populate user from the server if logged in? should be possible https://auth0.github.io/nextjs-auth0/types/client_use_user.UserProviderProps.html
  // Without doing so, there's a brief flicker of "Log in" before it changes to "Log out" on the client
  // Potentially use getInitialProps in _app.tsx because that's for all pages but it seems like that'd
  // remove automatic usage of static pages https://nextjs.org/docs/pages/api-reference/functions/get-initial-props
  const { sessionUser, authUser } = useSessionUser();
  const { asPath } = useRouter();

  const usingTinyScreen = useMediaQuery(theme.breakpoints.down("xs"));
  const usingBigScreen = useMediaQuery(theme.breakpoints.up("sm"));

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
    <>
      <AppBar position="sticky" className="border-b bg-gray-50 shadow-none">
        <Toolbar variant="dense">
          <Box flex="1" display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" gap={2} alignItems="center">
              <IconButton onClick={() => setIsSiteDrawerOpen(true)} sx={{ padding: "0" }}>
                <Menu />
              </IconButton>
              <SiteDrawer
                isSiteDrawerOpen={isSiteDrawerOpen}
                setIsSiteDrawerOpen={setIsSiteDrawerOpen}
              />

              <Box display="flex" position="relative">
                <Link href="/" display="flex">
                  <Image src={favicon} height={32} width={32} alt="home" />
                </Link>
                <MuiLink
                  href="https://ameliorate.app/docs/release-status"
                  variant="caption"
                  underline="hover"
                  className="absolute -right-2 -top-0.5 rotate-[30deg] text-text-primary"
                >
                  Alpha
                </MuiLink>
              </Box>
              {!usingTinyScreen && (
                <>
                  <NavLink href="/playground">Playground</NavLink>
                  <NavLink href="/examples">Examples</NavLink>
                </>
              )}
            </Box>

            <Box display="flex" gap={2} alignItems="center">
              {usingBigScreen && (
                <>
                  <NavLink href="https://ameliorate.app/docs" target="_blank">
                    Documentation
                  </NavLink>
                  <Link href={discordInvite} target="_blank" display="flex">
                    <Image
                      src={`/${theme.palette.mode}/Discord-Mark.png`}
                      height={24}
                      width={32}
                      alt="discord link"
                    />
                  </Link>
                  <Link href={githubRepo} target="_blank" display="flex">
                    <Image
                      src={`/${theme.palette.mode}/GitHub-Mark.png`}
                      height={32}
                      width={32}
                      alt="github link"
                    />
                  </Link>
                </>
              )}

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
                    <IconButton
                      onClick={() => setIsUserDrawerOpen(true)}
                      sx={{
                        height: "32px",
                        width: "32px",
                        padding: "0",
                        "& svg": { height: "100%", width: "100%" },
                      }}
                    >
                      <ProfileIcon username={sessionUser.username} />
                    </IconButton>
                  </Tooltip>
                  <UserDrawer
                    user={sessionUser}
                    isUserDrawerOpen={isUserDrawerOpen}
                    setIsUserDrawerOpen={setIsUserDrawerOpen}
                  />
                </>
              )}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* self-host font to prevent layout shift from fallback fonts loading first, see https://nextjs.org/docs/pages/building-your-application/optimizing/fonts */}
      <main className={roboto.className}>{children}</main>
    </>
  );
};

export default Layout;
