import { AppBar, Box, Toolbar } from "@mui/material";
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

const LayoutMaterial: NextPage<LayoutProps> = ({ children }) => {
  return (
    <>
      <AppBar position="sticky">
        <Toolbar variant="dense">
          <Box flex="1" display="flex" justifyContent="space-between" alignItems="center">
            <NavLink href="/">ameliorate</NavLink>
            <Box display="flex" gap="15px" alignItems="center">
              <NavLink href="/new">create understanding</NavLink>
              <NavLink href="/mine">my understandings</NavLink>
              <NavLink href="/about">about</NavLink>
              <NavLink href="/login">login</NavLink>
              <NavLink href="https://github.com/keyserj/ameliorate" display="flex">
                <Image src="/GitHub-Mark-64px.png" height={32} width={32} alt="github link" />
              </NavLink>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <main>{children}</main>
    </>
  );
};

export default LayoutMaterial;
