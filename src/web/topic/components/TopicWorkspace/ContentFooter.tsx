import {
  Build,
  Delete,
  EditOff,
  Error,
  Group,
  Highlight,
  QuestionMark,
  TabUnselected,
} from "@mui/icons-material";
import { Divider, IconButton, ToggleButton, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";

import { emitter } from "@/web/common/event";
import { useSessionUser } from "@/web/common/hooks";
import { HelpMenu } from "@/web/topic/components/TopicWorkspace/HelpMenu";
import { MoreActionsDrawer } from "@/web/topic/components/TopicWorkspace/MoreActionsDrawer";
import { QuickViewSelect } from "@/web/topic/components/TopicWorkspace/QuickViewSelect";
import { deleteGraphPart } from "@/web/topic/store/createDeleteActions";
import { useIsTableEdge } from "@/web/topic/store/edgeHooks";
import { useTopic } from "@/web/topic/store/topicHooks";
import { useUserCanEditTopicData } from "@/web/topic/store/userHooks";
import { hotkeys } from "@/web/topic/utils/hotkeys";
import {
  toggleFlashlightMode,
  toggleReadonlyMode,
  useFlashlightMode,
  useReadonlyMode,
} from "@/web/view/actionConfigStore";
import { useSelectedGraphPart } from "@/web/view/currentViewStore/store";
import {
  comparePerspectives,
  resetPerspectives,
  useIsComparingPerspectives,
} from "@/web/view/perspectiveStore";
import { toggleShowIndicators, useShowIndicators } from "@/web/view/userConfigStore";

interface Props {
  /**
   * True if footer should overlay on top of content, false if it should be in-line.
   *
   * Generally is true for diagram since diagram can be moved around the overlay if it's in the way,
   * otherwise false e.g. for table since that can't be moved if the overlay is in the way.
   */
  overlay: boolean;
}

export const ContentFooter = ({ overlay }: Props) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const topic = useTopic();
  const onPlayground = topic.id === undefined;

  const showIndicators = useShowIndicators();
  const isComparingPerspectives = useIsComparingPerspectives();
  const flashlightMode = useFlashlightMode();
  const readonlyMode = useReadonlyMode();
  const [hasErrored, setHasErrored] = useState(false);

  const selectedGraphPart = useSelectedGraphPart();
  const partIsTableEdge = useIsTableEdge(selectedGraphPart?.id ?? "");

  const [isMoreActionsDrawerOpen, setIsMoreActionsDrawerOpen] = useState(false);
  const [helpAnchorEl, setHelpAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const unbindErrored = emitter.on("errored", () => {
      setHasErrored(true);
    });

    return () => {
      unbindErrored();
    };
  }, []);

  return (
    <div
      className={
        // max-w to keep children from being wide, but also prevent from being wider than screen (e.g. small 320px screen is scrunched without padding on 20rem)
        "inset-x-0 bottom-0 flex flex-col gap-1.5 p-2 items-center *:max-w-[calc(min(20rem,100%))]" +
        (overlay
          ? " absolute z-10 pointer-events-none *:pointer-events-auto"
          : " bg-paperShaded-main border-t")
      }
    >
      {/* show this in content footer when screens are small and it doesn't fit between AppHeader corners, otherwise put in header */}
      <div className="block bg-paperShaded-main lg:hidden">
        <QuickViewSelect openDirection="top" />
      </div>

      {/* Toolbar */}
      <div className="flex rounded border bg-paperShaded-main">
        <ToggleButton
          value={showIndicators}
          title={`Show indicators (${hotkeys.showIndicators})`}
          aria-label={`Show indicators (${hotkeys.showIndicators})`}
          color="primary"
          size="small"
          selected={showIndicators}
          onClick={() => toggleShowIndicators()}
          className="rounded-full border-none"
        >
          <TabUnselected />
        </ToggleButton>

        {!onPlayground && (
          <>
            <ToggleButton
              value={isComparingPerspectives}
              title="Compare perspectives"
              aria-label="Compare perspectives"
              color="primary"
              size="small"
              selected={isComparingPerspectives}
              onClick={() =>
                isComparingPerspectives ? resetPerspectives() : comparePerspectives()
              }
              className="rounded-full border-none"
            >
              <Group />
            </ToggleButton>
          </>
        )}

        {/* TODO?: seems a bit awkward to only show when flashlight mode is on, but it's more awkward */}
        {/* if we have no way of telling that it's on when we're clicking around the diagram */}
        {flashlightMode && (
          <ToggleButton
            value={flashlightMode}
            title="Flashlight mode"
            aria-label="Flashlight mode"
            color="primary"
            size="small"
            selected={flashlightMode}
            onClick={() => toggleFlashlightMode(!flashlightMode)}
            className="rounded-full border-none"
          >
            <Highlight />
          </ToggleButton>
        )}

        {readonlyMode && (
          <ToggleButton
            value={readonlyMode}
            title={`Read-only mode (${hotkeys.readonlyMode})`}
            aria-label={`Read-only mode (${hotkeys.readonlyMode})`}
            color="primary"
            size="small"
            selected={readonlyMode}
            onClick={() => toggleReadonlyMode()}
            className="rounded-full border-none"
          >
            <EditOff />
          </ToggleButton>
        )}

        {userCanEditTopicData && (
          <>
            <Divider orientation="vertical" flexItem />

            <IconButton
              color="inherit"
              title="Delete"
              aria-label="Delete"
              onClick={() => {
                if (selectedGraphPart) {
                  deleteGraphPart(selectedGraphPart);
                }
              }}
              // don't allow modifying edges that are part of the table, because they should always exist as long as their nodes do
              disabled={!selectedGraphPart || partIsTableEdge}
            >
              <Delete />
            </IconButton>
          </>
        )}

        <Divider orientation="vertical" flexItem />

        <IconButton
          color="inherit"
          title="More actions"
          aria-label="More actions"
          onClick={() => setIsMoreActionsDrawerOpen(true)}
        >
          <Build />
        </IconButton>
        <MoreActionsDrawer
          isMoreActionsDrawerOpen={isMoreActionsDrawerOpen}
          setIsMoreActionsDrawerOpen={setIsMoreActionsDrawerOpen}
          sessionUser={sessionUser}
          userCanEditTopicData={userCanEditTopicData}
        />

        <IconButton
          color="inherit"
          title="Help"
          aria-label="Help"
          onClick={(event) => setHelpAnchorEl(event.currentTarget)}
        >
          <QuestionMark />
        </IconButton>
        <HelpMenu helpAnchorEl={helpAnchorEl} setHelpAnchorEl={setHelpAnchorEl} />

        {hasErrored && (
          <Tooltip
            title={
              <span>
                Failed to save changes - your changes will be lost after refreshing the page.
                <br />
                <br />
                Please refresh the page and try making your changes again, or download your topic
                with your changes and re-upload it after refreshing the page.
              </span>
            }
            enterTouchDelay={0} // allow touch to immediately trigger
            leaveTouchDelay={Infinity} // touch-away to close on mobile, since message is long
          >
            <IconButton
              color="error"
              aria-label="Error info"
              // Don't make it look like clicking will do something, since it won't.
              // Using a button here is an attempt to make it accessible, since the tooltip will show
              // on focus.
              className="cursor-default"
            >
              <Error />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </div>
  );
};
