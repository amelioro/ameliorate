import { Download, Upload } from "@mui/icons-material";
import { AppBar, Button, IconButton, Menu, MenuItem, Toolbar } from "@mui/material";
import fileDownload from "js-file-download";
import { useState } from "react";

import { getState, setState } from "../../store/actions";
import { AllDiagramState } from "../../store/store";

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
    .then((text) => setState(JSON.parse(text) as AllDiagramState))
    .catch((error) => {
      console.log("error reading file: ", error);
      throw new Error("Failed to read file");
    });
};

const loadExample = (exampleFileName: string) => {
  fetch(`/examples/${exampleFileName}`)
    .then((response) => response.json())
    // TODO: validate that file JSON matches interface
    .then((exampleState) => setState(exampleState as AllDiagramState))
    .catch((error) => {
      console.log("error loading example: ", error);
      throw new Error("Failed to load example");
    });
};

export const TopicToolbar = () => {
  // TODO: figure out how to extract a MUI menu component whose menu items close the menu on click
  // in addition to the menu item's onClick handler
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuIsOpen = Boolean(anchorEl);
  const openMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  return (
    <AppBar position="sticky" color="secondary">
      <Toolbar variant="dense">
        <Button color="inherit" onClick={openMenu}>
          Examples
        </Button>
        <Menu anchorEl={anchorEl} open={menuIsOpen} onClose={closeMenu}>
          <MenuItem
            onClick={() => {
              closeMenu();
              loadExample("world_hunger.json");
            }}
          >
            World Hunger
          </MenuItem>
        </Menu>
        <IconButton color="inherit" onClick={downloadTopic}>
          <Download />
        </IconButton>
        <IconButton color="inherit" component="label">
          <Upload />
          <input hidden accept=".json" type="file" onChange={uploadTopic} />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};
