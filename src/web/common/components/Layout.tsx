import { AccountCircle } from "@mui/icons-material";
import { AppBar, Box, IconButton, Toolbar, useTheme } from "@mui/material";
import { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";

import { useSessionUser } from "../hooks";
import { discordInvite, feedbackPage, githubRepo } from "../urls";
import { Link } from "./Link";
import { UserDrawer } from "./UserDrawer/UserDrawer";

interface NavLinkProps {
  href: string;
  target?: string;
  display?: string;
  children: ReactNode;
}

interface LayoutProps {
  children: ReactNode;
}

const NavLink = ({ href, target, display, children }: NavLinkProps) => {
  return (
    <Link href={href} target={target} display={display} color="text" underline="none">
      {children}
    </Link>
  );
};

const Layout: NextPage<LayoutProps> = ({ children }) => {
  const theme = useTheme();

  // How to always populate user from the server if logged in? should be possible https://auth0.github.io/nextjs-auth0/types/client_use_user.UserProviderProps.html
  // Without doing so, there's a brief flicker of "Log in" before it changes to "Log out" on the client
  // Potentially use getInitialProps in _app.tsx because that's for all pages but it seems like that'd
  // remove automatic usage of static pages https://nextjs.org/docs/pages/api-reference/functions/get-initial-props
  const { sessionUser, authUser } = useSessionUser();
  const { pathname } = useRouter();

  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);

  useEffect(() => {
    // close drawers after navigating
    setIsUserDrawerOpen(false);
  }, [pathname]);

  const isAuthed = authUser != null;
  const isLoggedIn = sessionUser != null;

  return (
    <>
      <AppBar position="sticky">
        <Toolbar variant="dense">
          <Box flex="1" display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" gap="16px" alignItems="center">
              <NavLink href="/" display="flex">
                <Image src="/favicon.ico" height={32} width={32} alt="home" />
              </NavLink>
              <NavLink href="/playground">Playground</NavLink>
              <NavLink href="/examples">Examples</NavLink>
            </Box>

            <Box display="flex" gap={2} alignItems="center">
              <NavLink href={feedbackPage} target="_blank">
                Feedback
              </NavLink>
              <NavLink href="/about">About</NavLink>
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

              {!isLoggedIn && (
                <NavLink href={isAuthed ? "/choose-username" : "/api/auth/login"}>
                  {isAuthed ? "Username" : "Log in"}
                </NavLink>
              )}

              {isLoggedIn && (
                <>
                  <IconButton
                    onClick={() => setIsUserDrawerOpen(true)}
                    sx={{
                      height: "32px",
                      width: "32px",
                      padding: "0",
                      "& svg": { height: "100%", width: "100%" },
                    }}
                  >
                    {/* annoyingly this svg doesn't stretch to the edge, so it looks smaller than 32px. oh well */}
                    <AccountCircle />
                  </IconButton>
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

      <main>{children}</main>
    </>
  );
};

export default Layout;
