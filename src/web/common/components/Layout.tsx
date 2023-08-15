import { AppBar, Box, Toolbar, useTheme } from "@mui/material";
import { NextPage } from "next";
import Image from "next/image";
import { ReactNode } from "react";

import { useSessionUser } from "../hooks";
import { Link } from "./Link";

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

  const isAuthed = authUser != null;
  const isLoggedIn = sessionUser != null;

  const githubIconSrc =
    theme.palette.mode == "light" ? "/GitHub-Mark-64px.png" : "/GitHub-Mark-Light-64px.png";
  const discordIconSrc =
    theme.palette.mode == "light" ? "/Discord-Mark-Black.png" : "/Discord-Mark-White.png";
  const facebookIconSrc =
    theme.palette.mode == "light" ? "/Facebook-Icon-Black.png" : "/Facebook-Icon-White.png";

  return (
    <>
      <AppBar position="sticky">
        <Toolbar variant="dense">
          <Box flex="1" display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" gap="15px" alignItems="center">
              <NavLink href="/">Ameliorate</NavLink>
              {isLoggedIn && <NavLink href={`/${sessionUser.username}`}>My Topics</NavLink>}
              <NavLink href="/playground">Playground</NavLink>
              <NavLink href="/examples">Examples</NavLink>
            </Box>

            <Box display="flex" gap="15px" alignItems="center">
              <NavLink
                href="https://github.com/amelioro/ameliorate/blob/main/CONTRIBUTING.md#providing-feedback"
                target="_blank"
              >
                Feedback
              </NavLink>
              <NavLink href="/about">About</NavLink>
              <NavLink
                href={
                  isLoggedIn
                    ? "/api/auth/logout"
                    : isAuthed
                    ? "/choose-username"
                    : "/api/auth/login"
                }
              >
                {isLoggedIn ? "Log out" : isAuthed ? "Username" : "Log in"}
              </NavLink>
              <NavLink
                href="https://www.facebook.com/profile.php?id=100091844721178"
                target="_blank"
                display="flex"
              >
                <Image src={facebookIconSrc} height={32} width={32} alt="facebook link" />
              </NavLink>
              <NavLink href="https://discord.gg/3KhdyJkTWT" target="_blank" display="flex">
                <Image src={discordIconSrc} height={24} width={32} alt="discord link" />
              </NavLink>
              <NavLink href="https://github.com/amelioro/ameliorate" target="_blank" display="flex">
                <Image src={githubIconSrc} height={32} width={32} alt="github link" />
              </NavLink>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <main>{children}</main>
    </>
  );
};

export default Layout;
