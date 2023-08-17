import {
  AlignVerticalTop,
  AutoStoriesOutlined,
  Download,
  Redo,
  Route,
  Undo,
  Upload,
} from "@mui/icons-material";
import { AppBar, Divider, IconButton, Toolbar } from "@mui/material";
import fileDownload from "js-file-download";
import { StorageValue } from "zustand/middleware";

import { errorWithData } from "../../../../common/errorHandling";
import { useSessionUser } from "../../../common/hooks";
import { migrate } from "../../store/migrate";
import { TopicStoreState, useIsTableActive, useShowImpliedEdges } from "../../store/store";
import { useUserCanEditTopicData } from "../../store/userHooks";
import { getPersistState, redo, resetTopicData, setTopicData, undo } from "../../store/utilActions";
import { useTemporalHooks } from "../../store/utilHooks";
import { getTopicTitle } from "../../store/utils";
import { relayout, toggleShowImpliedEdges } from "../../store/viewActions";
import { StyledToggleButton } from "./TopicToolbar.styles";

// TODO: might be useful to have downloaded state be more human editable;
// for this, probably should prettify the JSON, and remove position values (we can re-layout on import)
const downloadTopic = () => {
  const persistState = getPersistState();

  const topicState = persistState.state;
  const topicTitle = getTopicTitle(topicState);
  const sanitizedFileName = topicTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase(); // thanks https://stackoverflow.com/a/8485137

  fileDownload(JSON.stringify(persistState), `${sanitizedFileName}.json`);
};

const uploadTopic = (event: React.ChangeEvent<HTMLInputElement>) => {
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

      setTopicData(migratedState);
    })
    .catch((error) => {
      throw error;
    });
};

export const TopicToolbar = () => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.id);
  const isTableActive = useIsTableActive();
  const showImpliedEdges = useShowImpliedEdges();
  const [canUndo, canRedo] = useTemporalHooks();

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
              <input hidden accept=".json" type="file" onChange={uploadTopic} />
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
            <IconButton color="inherit" title="Reset" aria-label="Reset" onClick={resetTopicData}>
              <AutoStoriesOutlined />
            </IconButton>
          </>
        )}

        {/* view actions */}
        {!isTableActive && (
          <>
            <Divider orientation="vertical" />

            <IconButton
              color="inherit"
              title="Recalculate layout"
              aria-label="Recalculate layout"
              onClick={() => void relayout()}
            >
              <AlignVerticalTop />
            </IconButton>

            <StyledToggleButton
              value={showImpliedEdges}
              title="Show implied edges"
              aria-label="Show implied edges"
              color="secondary"
              size="small"
              selected={showImpliedEdges}
              onClick={() => toggleShowImpliedEdges(!showImpliedEdges)}
            >
              <Route />
            </StyledToggleButton>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};
