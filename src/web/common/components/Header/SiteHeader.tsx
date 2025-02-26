import { AppBar, Toolbar, useTheme } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/router";

import { Logo } from "@/web/common/components/Header/Logo";
import { ProfileButton } from "@/web/common/components/Header/ProfileButton";
import { SiteMenu } from "@/web/common/components/Header/SiteMenu";
import { Link } from "@/web/common/components/Link";
import { NavLink } from "@/web/common/components/NavLink";
import { useSessionUser } from "@/web/common/hooks";
import { discordInvite, githubRepo } from "@/web/common/urls";

export const SiteHeader = () => {
  const theme = useTheme();

  // How to always populate user from the server if logged in? should be possible https://auth0.github.io/nextjs-auth0/types/client_use_user.UserProviderProps.html
  // Without doing so, there's a brief flicker of "Log in" before it changes to "Log out" on the client
  // Potentially use getInitialProps in _app.tsx because that's for all pages but it seems like that'd
  // remove automatic usage of static pages https://nextjs.org/docs/pages/api-reference/functions/get-initial-props
  const { sessionUser } = useSessionUser();
  const { route } = useRouter();

  // We want a different header for the App, so we can't rely on the root layout for header everywhere.
  // Moving to nextjs app dir should make it easier to only use SiteHeader vs AppHeader based on
  // route, without having to `useRouter` with hardcoded values like this.
  if (route == "/[username]/[topicTitle]" || route == "/playground") return null;

  return (
    <AppBar position="sticky" className="overflow-x-auto border-b bg-paperShaded-main shadow-none">
      {/* <Toolbar variant="dense"> */}
      <Toolbar className="h-12 min-h-[auto]">
        <div className="flex flex-1 items-center justify-between gap-4 *:shrink-0">
          <div className="flex items-center gap-4">
            <SiteMenu className="p-0 sm:hidden" />
            <Logo />
            <NavLink href="/playground" className="hidden sm:block">
              Playground
            </NavLink>
            {sessionUser && (
              <>
                <NavLink href={`/${sessionUser.username}`} className="hidden sm:block">
                  My Topics
                </NavLink>
                <NavLink href={"/new"} className="hidden sm:block">
                  New Topic
                </NavLink>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <NavLink href="https://ameliorate.app/docs" target="_blank" className="hidden sm:block">
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
            <ProfileButton />
          </div>
        </div>
      </Toolbar>
    </AppBar>
  );
};
