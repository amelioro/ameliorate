import {
  AlignVerticalTop,
  AutoStoriesOutlined,
  Download,
  ExpandMore,
  Redo,
  Route,
  Undo,
  Upload,
} from "@mui/icons-material";
import { AppBar, Button, Divider, IconButton, MenuItem, Toolbar } from "@mui/material";
import fileDownload from "js-file-download";

import { Menu } from "../../../../common/components/Menu/Menu";
import { useMenu } from "../../../../common/hooks";
import { TopicStoreState, useIsTableActive, useShowImpliedEdges } from "../../store/store";
import { getState, redo, resetState, setState, undo } from "../../store/utilActions";
import { getTopicTitle } from "../../store/utils";
import { relayout, toggleShowImpliedEdges } from "../../store/viewActions";
import { StyledToggleButton } from "./TopicToolbar.styles";

// TODO: might be useful to have downloaded state be more human editable;
// for this, probably should prettify the JSON, and remove position values (we can re-layout on import)
const downloadTopic = () => {
  const topicState = getState();
  const topicTitle = getTopicTitle(topicState);
  const sanitizedFileName = topicTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase(); // thanks https://stackoverflow.com/a/8485137
  fileDownload(JSON.stringify(topicState), `${sanitizedFileName}.json`);
};

const uploadTopic = (event: React.ChangeEvent<HTMLInputElement>) => {
  if (event.target.files === null || event.target.files.length === 0) return;

  event.target.files[0]
    .text()
    // TODO: validate that file JSON matches interface
    .then((text) => setState(JSON.parse(text) as TopicStoreState))
    .catch((error) => {
      console.log("error reading file: ", error);
      throw new Error("Failed to read file");
    });
};

const loadExample = (exampleFileName: string) => {
  fetch(`/examples/${exampleFileName}`)
    .then((response) => response.json())
    // TODO: validate that file JSON matches interface
    .then((exampleState) => setState(exampleState as TopicStoreState))
    .catch((error) => {
      console.log("error loading example: ", error);
      throw new Error("Failed to load example");
    });
};

export const TopicToolbar = () => {
  const [anchorEl, menuIsOpen, openMenu, closeMenu] = useMenu();
  const isTableActive = useIsTableActive();
  const showImpliedEdges = useShowImpliedEdges();

  return (
    <AppBar position="sticky" color="primaryVariantLight">
      <Toolbar variant="dense">
        {/* load actions */}

        <Button color="inherit" onClick={openMenu}>
          Examples
          <ExpandMore />
        </Button>
        <Menu anchorEl={anchorEl} isOpen={menuIsOpen} closeMenu={closeMenu}>
          <MenuItem onClick={() => loadExample("economic_system.json")}>Economic System</MenuItem>
          <MenuItem onClick={() => loadExample("living_location.json")}>Living Location</MenuItem>
          <MenuItem onClick={() => loadExample("unwanted_pregnancy.json")}>
            Unwanted Pregnancy
          </MenuItem>
          <MenuItem onClick={() => loadExample("world_hunger.json")}>World Hunger</MenuItem>
          <MenuItem onClick={() => loadExample("ameliorate.json")}>Ameliorate</MenuItem>
        </Menu>
        <IconButton color="inherit" title="Download" aria-label="Download" onClick={downloadTopic}>
          <Download />
        </IconButton>
        <IconButton color="inherit" component="label" title="Upload" aria-label="Upload">
          <Upload />
          <input hidden accept=".json" type="file" onChange={uploadTopic} />
        </IconButton>

        <Divider orientation="vertical" />
        {/* diagram state change actions */}

        {/* TODO: disable undo/redo when there's nothing to undo/redo; right now can't use hooks for temporal state
        because it doesn't work with persist middleware.
        once this currently-in-progress PR merges, we should be able to do that easily!
        https://github.com/charkour/zundo/pull/61 */}
        <IconButton color="inherit" title="Undo" aria-label="Undo" onClick={undo}>
          <Undo />
        </IconButton>
        <IconButton color="inherit" title="Redo" aria-label="Redo" onClick={redo}>
          <Redo />
        </IconButton>
        <IconButton color="inherit" title="Reset" aria-label="Reset" onClick={resetState}>
          <AutoStoriesOutlined />
        </IconButton>

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
