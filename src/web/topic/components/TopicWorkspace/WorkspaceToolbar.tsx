import {
  ArrowBack,
  ArrowForward,
  Build,
  Delete,
  Error,
  Group,
  Highlight,
  Redo,
  Undo,
} from "@mui/icons-material";
import { AppBar, Divider, IconButton, ToggleButton, Toolbar, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";

import { emitter } from "@/web/common/event";
import { useSessionUser } from "@/web/common/hooks";
import { MoreActionsDrawer } from "@/web/topic/components/TopicWorkspace/MoreActionsDrawer";
import { deleteGraphPart } from "@/web/topic/store/createDeleteActions";
import { useOnPlayground } from "@/web/topic/store/topicHooks";
import { useUserCanEditTopicData } from "@/web/topic/store/userHooks";
import { redo, undo } from "@/web/topic/store/utilActions";
import { useTemporalHooks } from "@/web/topic/store/utilHooks";
import { toggleFlashlightMode, useFlashlightMode } from "@/web/view/actionConfigStore";
import {
  goBack,
  goForward,
  useCanGoBackForward,
  useSelectedGraphPart,
} from "@/web/view/currentViewStore/store";
import {
  comparePerspectives,
  resetPerspectives,
  useIsComparingPerspectives,
} from "@/web/view/perspectiveStore";

export const WorkspaceToolbar = () => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);
  const onPlayground = useOnPlayground();
  const [canUndo, canRedo] = useTemporalHooks();
  const [canGoBack, canGoForward] = useCanGoBackForward();
  const isComparingPerspectives = useIsComparingPerspectives();
  const flashlightMode = useFlashlightMode();
  const [hasErrored, setHasErrored] = useState(false);

  const selectedGraphPart = useSelectedGraphPart();

  const [isMoreActionsDrawerOpen, setIsMoreActionsDrawerOpen] = useState(false);

  useEffect(() => {
    const unbindErrored = emitter.on("errored", () => {
      setHasErrored(true);
    });

    return () => {
      unbindErrored();
    };
  }, []);

  return (
    <AppBar position="sticky" className="border-b bg-gray-50 shadow-none">
      <Toolbar variant="dense">
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
            {/* diagram state change actions */}

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
              disabled={!selectedGraphPart}
            >
              <Delete />
            </IconButton>
          </>
        )}

        {!onPlayground && (
          <>
            <Divider orientation="vertical" flexItem />

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
              sx={{ borderRadius: "50%", border: "0" }}
            >
              <Group />
            </ToggleButton>
          </>
        )}

        <Divider orientation="vertical" flexItem />

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
            sx={{ borderRadius: "50%", border: "0" }}
          >
            <Highlight />
          </ToggleButton>
        )}

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
              sx={{
                // Don't make it look like clicking will do something, since it won't.
                // Using a button here is an attempt to make it accessible, since the tooltip will show
                // on focus.
                cursor: "default",
              }}
            >
              <Error />
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>
    </AppBar>
  );
};
