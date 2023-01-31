import { AutoStoriesOutlined, Download, ExpandMore, Redo, Undo, Upload } from "@mui/icons-material";
import { AppBar, Button, Divider, IconButton, MenuItem, Toolbar } from "@mui/material";
import fileDownload from "js-file-download";

import { Menu } from "../../../../common/components/Menu/Menu";
import { useMenu } from "../../../../common/hooks";
import { getState, redo, resetState, setState, undo } from "../../store/actions";
import { DiagramStoreState } from "../../store/store";

// TODO: might be useful to have downloaded state be more human editable;
// for this, probably should prettify the JSON, and remove position values (we can re-layout on import)
const downloadTopic = () => {
  const topicState = getState();
  fileDownload(JSON.stringify(topicState), `${topicState.activeDiagramId}.json`);
};

const uploadTopic = (event: React.ChangeEvent<HTMLInputElement>) => {
  if (event.target.files === null || event.target.files.length === 0) return;

  event.target.files[0]
    .text()
    // TODO: validate that file JSON matches interface
    .then((text) => setState(JSON.parse(text) as DiagramStoreState))
    .catch((error) => {
      console.log("error reading file: ", error);
      throw new Error("Failed to read file");
    });
};

const loadExample = (exampleFileName: string) => {
  fetch(`/examples/${exampleFileName}`)
    .then((response) => response.json())
    // TODO: validate that file JSON matches interface
    .then((exampleState) => setState(exampleState as DiagramStoreState))
    .catch((error) => {
      console.log("error loading example: ", error);
      throw new Error("Failed to load example");
    });
};

export const TopicToolbar = () => {
  const [anchorEl, menuIsOpen, openMenu, closeMenu] = useMenu();

  return (
    <AppBar position="sticky" color="primaryVariantLight">
      <Toolbar variant="dense">
        <Button color="inherit" onClick={openMenu}>
          Examples
          <ExpandMore />
        </Button>
        <Menu anchorEl={anchorEl} isOpen={menuIsOpen} closeMenu={closeMenu}>
          <MenuItem onClick={() => loadExample("living_location.json")}>Living Location</MenuItem>
          <MenuItem onClick={() => loadExample("unwanted_pregnancy.json")}>
            Unwanted Pregnancy
          </MenuItem>
          <MenuItem onClick={() => loadExample("world_hunger.json")}>World Hunger</MenuItem>
          <MenuItem onClick={() => loadExample("ameliorate.json")}>Ameliorate</MenuItem>
        </Menu>
        <IconButton color="inherit" onClick={downloadTopic}>
          <Download />
        </IconButton>
        <IconButton color="inherit" component="label">
          <Upload />
          <input hidden accept=".json" type="file" onChange={uploadTopic} />
        </IconButton>

        <Divider orientation="vertical" />

        {/* TODO: disable undo/redo when there's nothing to undo/redo; right now can't use hooks for temporal state
        because it doesn't work with persist middleware.
        once this currently-in-progress PR merges, we should be able to do that easily!
        https://github.com/charkour/zundo/pull/61 */}
        <IconButton color="inherit" onClick={undo}>
          <Undo />
        </IconButton>
        <IconButton color="inherit" onClick={redo}>
          <Redo />
        </IconButton>
        <IconButton color="inherit" onClick={resetState}>
          <AutoStoriesOutlined />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};
