import {
  ArrowBack,
  ArrowForward,
  Build,
  Delete,
  Error,
  Group,
  Redo,
  Undo,
} from "@mui/icons-material";
import { AppBar, Divider, IconButton, ToggleButton, Toolbar, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";

import { emitter } from "../../../common/event";
import { useSessionUser } from "../../../common/hooks";
import {
  goBack,
  goForward,
  useCanGoBackForward,
  useSelectedGraphPart,
} from "../../../view/navigateStore";
import {
  comparePerspectives,
  resetPerspectives,
  useIsComparingPerspectives,
} from "../../../view/store/store";
import { deleteGraphPart } from "../../store/createDeleteActions";
import { useOnPlayground } from "../../store/topicHooks";
import { useUserCanEditTopicData } from "../../store/userHooks";
import { redo, undo } from "../../store/utilActions";
import { useTemporalHooks } from "../../store/utilHooks";
import { MoreActionsDrawer } from "./MoreActionsDrawer";

export const TopicToolbar = () => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);
  const onPlayground = useOnPlayground();
  const [canUndo, canRedo] = useTemporalHooks();
  const [canGoBack, canGoForward] = useCanGoBackForward();
  const isComparingPerspectives = useIsComparingPerspectives();
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
    <AppBar position="sticky" color="primaryVariantLight">
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
            <Divider orientation="vertical" />
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

            <Divider orientation="vertical" />

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
            <Divider orientation="vertical" />

            <ToggleButton
              value={isComparingPerspectives}
              title="Compare perspectives"
              aria-label="Compare perspectives"
              color="secondary"
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

        <Divider orientation="vertical" />

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
