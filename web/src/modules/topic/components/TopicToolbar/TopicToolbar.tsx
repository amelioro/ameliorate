import { AutoStoriesOutlined, Download, ExpandMore, Upload } from "@mui/icons-material";
import { AppBar, Button, Divider, IconButton, MenuItem, Toolbar } from "@mui/material";
import fileDownload from "js-file-download";

import { Menu } from "../../../../common/components/Menu/Menu";
import { useMenu } from "../../../../common/hooks";
import { getState, resetState, setState } from "../../store/actions";
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
          <MenuItem onClick={() => loadExample("abortion.json")}>Abortion</MenuItem>
          <MenuItem onClick={() => loadExample("world_hunger.json")}>World Hunger</MenuItem>
        </Menu>
        <IconButton color="inherit" onClick={downloadTopic}>
          <Download />
        </IconButton>
        <IconButton color="inherit" component="label">
          <Upload />
          <input hidden accept=".json" type="file" onChange={uploadTopic} />
        </IconButton>

        <Divider orientation="vertical" />

        <IconButton color="inherit" onClick={resetState}>
          <AutoStoriesOutlined />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};
