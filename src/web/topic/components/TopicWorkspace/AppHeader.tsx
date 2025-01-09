import { ArrowBack, ArrowForward, Redo, Undo } from "@mui/icons-material";
import { Divider, IconButton, useTheme } from "@mui/material";
import Image from "next/image";

import { Logo } from "@/web/common/components/Header/Logo";
import { ProfileButton } from "@/web/common/components/Header/ProfileButton";
import { SiteMenu } from "@/web/common/components/Header/SiteMenu";
import { Link } from "@/web/common/components/Link";
import { NavLink } from "@/web/common/components/NavLink";
import { useSessionUser } from "@/web/common/hooks";
import { discordInvite, githubRepo } from "@/web/common/urls";
import { useUserCanEditTopicData } from "@/web/topic/store/userHooks";
import { redo, undo } from "@/web/topic/store/utilActions";
import { useTemporalHooks } from "@/web/topic/store/utilHooks";
import { goBack, goForward, useCanGoBackForward } from "@/web/view/currentViewStore/store";

// TODO: check if need overflow-x-auto to deal with increased html font size
// h-[49px] to match SiteHeader's 48px + 1px border
// border stuff to allow corners to have their own border on large screens, but use the parent's shared border for smaller screens
const headerCornerClasses = "h-[49px] bg-paperShaded-main flex items-center border-0 lg:border-b";

export const AppHeader = () => {
  const theme = useTheme();

  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const [canGoBack, canGoForward] = useCanGoBackForward();
  const [canUndo, canRedo] = useTemporalHooks();

  const leftHeader = (
    // pr-[11px] to line up right edge of corner exactly with pane (which is 376px wide + 1px border)
    <div className={"pl-1 pr-[11px] border-r " + headerCornerClasses}>
      <SiteMenu />
      <Logo className="ml-1 mr-4" titleClassName="hidden xl:flex" />

      <Divider orientation="vertical" flexItem />

      {/* Header Actions are classic/not-Ameliorate-specific... this keeps more space in the toolbar for more-valuable/Ameliorate-specific actions */}
      <div className="flex h-full items-center">
        <IconButton
          color="inherit"
          title="Back"
          aria-label="Back"
          onClick={goBack}
          disabled={!canGoBack}
        >
          <ArrowBack />
        </IconButton>
        <IconButton
          color="inherit"
          title="Forward"
          aria-label="Forward"
          onClick={goForward}
          disabled={!canGoForward}
        >
          <ArrowForward />
        </IconButton>

        {userCanEditTopicData && (
          <>
            <Divider orientation="vertical" flexItem />

            <IconButton
              color="inherit"
              title="Undo"
              aria-label="Undo"
              onClick={undo}
              disabled={!canUndo}
            >
              <Undo />
            </IconButton>
            <IconButton
              color="inherit"
              title="Redo"
              aria-label="Redo"
              onClick={redo}
              disabled={!canRedo}
            >
              <Redo />
            </IconButton>
          </>
        )}
      </div>
    </div>
  );

  const rightHeader = (
    // gap-4 on right header but not left because toolbar buttons already have spacing
    <div className={"px-2 border-l gap-4 " + headerCornerClasses}>
      <NavLink href="https://ameliorate.app/docs" target="_blank" className="hidden xl:block">
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
  );

  return (
    // overlays for large screens, inlines for small screens (because there isn't much space between corners for small screens)
    // z-10 to be in front of panes
    // pointer-events-none with *:auto so that space between corners allows clicks (e.g. on diagram) to pass through
    <div className="pointer-events-none relative top-0 z-10 flex w-full items-center justify-between border-b bg-paperShaded-main *:pointer-events-auto lg:absolute lg:border-0 lg:bg-inherit">
      {leftHeader}
      {rightHeader}
    </div>
  );
};
