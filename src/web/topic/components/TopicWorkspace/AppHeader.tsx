import { ArrowBack, ArrowForward, Redo, Settings, Undo } from "@mui/icons-material";
import { Dialog, Divider, IconButton, useTheme } from "@mui/material";
import Image from "next/image";
import { useState } from "react";

import { Logo } from "@/web/common/components/Header/Logo";
import { ProfileButton } from "@/web/common/components/Header/ProfileButton";
import { SiteMenu } from "@/web/common/components/Header/SiteMenu";
import { Link } from "@/web/common/components/Link";
import { NavLink } from "@/web/common/components/NavLink";
import { useSessionUser } from "@/web/common/hooks";
import { discordInvite, githubRepo } from "@/web/common/urls";
import { EditTopicForm } from "@/web/topic/components/TopicForm/TopicForm";
import { useTopic } from "@/web/topic/store/topicHooks";
import { useUserCanEditTopicData, useUserIsCreator } from "@/web/topic/store/userHooks";
import { redo, undo } from "@/web/topic/store/utilActions";
import { useTemporalHooks } from "@/web/topic/store/utilHooks";
import { goBack, goForward, useCanGoBackForward } from "@/web/view/currentViewStore/store";
import { normalizeTitle } from "@/common/topic";

// TODO: check if need overflow-x-auto to deal with increased html font size
// h-[calc(3rem + 1 px)] to match SiteHeader's 48px + 1px border
// border stuff to allow corners to have their own border on large screens, but use the parent's shared border for smaller screens
const headerCornerClasses = "h-[calc(3rem_+_1px)] bg-paperShaded-main flex items-center";

export const AppHeader = () => {
  const [topicFormOpen, setTopicFormOpen] = useState(false);

  const theme = useTheme();

  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);
  const userIsCreator = useUserIsCreator(sessionUser?.username);

  const topic = useTopic();
  const onPlayground = topic.id === undefined;
  const showSettings = !onPlayground && sessionUser && userIsCreator;

  const [canGoBack, canGoForward] = useCanGoBackForward();
  const [canUndo, canRedo] = useTemporalHooks();

  const leftHeader = (
    // shrink-0 because center header should be the only one shrinking
    <div className={"shrink-0 pl-1 " + headerCornerClasses}>
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

        <Divider orientation="vertical" flexItem />
      </div>
    </div>
  );

  const centerHeader = (
    // Max-w on individual children so that topic title can take up more space than creator's name,
    // since it usually will be longer, yet keep creator name from being scrunched if it's already short but topic title is really long.
    // Classes like text-nowrap are for keeping children on one line, because we don't want them taking much vertical space.
    <div
      className={
        "flex items-center justify-center text-nowrap min-w-0 max-w-full" +
        // settings button has right padding, so exclude right padding if that's showing
        (showSettings ? " pl-8 pr-6" : " px-8")
      }
    >
      {onPlayground ? (
        "Playground Topic"
      ) : (
        <>
          <Link
            // hardcoded max-w instead of % because it seems like % results in the parent div being wider than these contents, despite being a flex container and items/justify center
            className="min-w-12 max-w-28 overflow-hidden text-ellipsis"
            href={`/${topic.creatorName}`}
            title={topic.creatorName} // allow hovering since it can be truncated
          >
            {topic.creatorName}
          </Link>
          <span className="shrink-0 px-1">/</span>
          <Link
            className="overflow-hidden text-ellipsis"
            href={`/${topic.creatorName}/${normalizeTitle(topic.title)}`}
            title={topic.title} // allow hovering since it can be truncated
          >
            {topic.title}
          </Link>
        </>
      )}

      {showSettings && (
        <>
          <IconButton
            size="small"
            title="Settings"
            aria-label="Settings"
            onClick={() => setTopicFormOpen(true)}
          >
            <Settings fontSize="inherit" />
          </IconButton>
          <Dialog
            open={topicFormOpen}
            onClose={() => setTopicFormOpen(false)}
            aria-label="Topic Settings"
          >
            <EditTopicForm topic={topic} creatorName={sessionUser.username} />
          </Dialog>
        </>
      )}
    </div>
  );

  const rightHeader = (
    // gap-4 on right header but not left because toolbar buttons already have spacing
    <div className={"shrink-0 px-2 border-l gap-4 " + headerCornerClasses}>
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
    <>
      {/* overlays for large screens, inlines for small screens (because there isn't much space between corners for small screens) */}
      <div className="hidden w-full items-center justify-between border-b bg-paperShaded-main md:flex">
        {leftHeader}
        {centerHeader}
        {rightHeader}
      </div>
      <div className="flex w-full flex-col items-center border-b bg-paperShaded-main md:hidden">
        <div className="flex w-full items-center justify-between">
          {leftHeader}
          {rightHeader}
        </div>
        <Divider flexItem />
        {/* pull center header below the left/right header because there isn't enough space to all be on one same line */}
        {centerHeader}
      </div>
    </>
  );
};
