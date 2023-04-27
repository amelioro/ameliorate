import { AppBar, Box, Toolbar, useTheme } from "@mui/material";
import { NextPage } from "next";
import Image from "next/image";
import { ReactNode } from "react";

import Link from "./Link";

interface NavLinkProps {
  href: string;
  display?: string;
  children: ReactNode;
}

interface LayoutProps {
  children: ReactNode;
}

const NavLink = ({ href, display, children }: NavLinkProps) => {
  return (
    <Link href={href} display={display} color="text" underline="none">
      {children}
    </Link>
  );
};

const Layout: NextPage<LayoutProps> = ({ children }) => {
  const theme = useTheme();
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
            <NavLink href="/">ameliorate</NavLink>
            <Box display="flex" gap="15px" alignItems="center">
              {/* <NavLink href="/new">create understanding</NavLink> */}
              {/* <NavLink href="/mine">my understandings</NavLink> */}
              <NavLink href="/about">about</NavLink>
              {/* <NavLink href="/login">login</NavLink> */}
              <NavLink href="https://www.facebook.com/profile.php?id=100091844721178" display="flex">
                <Image src={facebookIconSrc} height={32} width={32} alt="facebook link" />
              </NavLink>
              <NavLink href="https://discord.gg/3KhdyJkTWT" display="flex">
                <Image src={discordIconSrc} height={24} width={32} alt="discord link" />
              </NavLink>
              <NavLink href="https://github.com/amelioro/ameliorate" display="flex">
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
