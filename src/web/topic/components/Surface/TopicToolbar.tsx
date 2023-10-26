import { Build, Delete, Download, Error, Group, Redo, Undo, Upload } from "@mui/icons-material";
import { AppBar, Divider, IconButton, ToggleButton, Toolbar, Tooltip } from "@mui/material";
import fileDownload from "js-file-download";
import { useEffect, useState } from "react";
import { StorageValue } from "zustand/middleware";

import { errorWithData } from "../../../../common/errorHandling";
import { emitter } from "../../../common/event";
import { useSessionUser } from "../../../common/hooks";
import {
  comparePerspectives,
  resetPerspectives,
  useIsComparingPerspectives,
} from "../../../view/store/store";
import { deleteGraphPart } from "../../store/createDeleteActions";
import { useSelectedGraphPart } from "../../store/graphPartHooks";
import { migrate } from "../../store/migrate";
import { TopicStoreState } from "../../store/store";
import { useOnPlayground } from "../../store/topicHooks";
import { useUserCanEditTopicData } from "../../store/userHooks";
import { getPersistState, redo, setTopicData, undo } from "../../store/utilActions";
import { useTemporalHooks } from "../../store/utilHooks";
import { getTopicTitle } from "../../store/utils";
import { MoreActionsDrawer } from "./MoreActionsDrawer";

// TODO: might be useful to have downloaded state be more human editable;
// for this, probably should prettify the JSON, and remove position values (we can re-layout on import)
const downloadTopic = () => {
  const persistState = getPersistState();

  const topicState = persistState.state;
  const topicTitle = getTopicTitle(topicState);
  const sanitizedFileName = topicTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase(); // thanks https://stackoverflow.com/a/8485137

  fileDownload(JSON.stringify(persistState), `${sanitizedFileName}.json`);
};

const uploadTopic = (event: React.ChangeEvent<HTMLInputElement>, sessionUsername?: string) => {
  if (event.target.files === null) return;

  const file = event.target.files[0];
  if (!file) return;

  file
    .text()
    .then((text) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO: validate that JSON matches interface
      const persistState = JSON.parse(text) as StorageValue<TopicStoreState>;
      if (!persistState.version) {
        throw errorWithData("No version found in file, cannot migrate old state", persistState);
      }

      const migratedState = migrate(persistState.state, persistState.version) as TopicStoreState;

      setTopicData(migratedState, sessionUsername);
    })
    .catch((error) => {
      throw error;
    });
};

export const TopicToolbar = () => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);
  const onPlayground = useOnPlayground();
  const [canUndo, canRedo] = useTemporalHooks();
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
        {/* load actions */}
        <IconButton color="inherit" title="Download" aria-label="Download" onClick={downloadTopic}>
          <Download />
        </IconButton>

        {userCanEditTopicData && (
          <>
            <IconButton color="inherit" component="label" title="Upload" aria-label="Upload">
              <Upload />
              <input
                hidden
                accept=".json"
                type="file"
                onChange={(event) => uploadTopic(event, sessionUser?.username)}
              />
            </IconButton>

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
                  void deleteGraphPart(selectedGraphPart);
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
