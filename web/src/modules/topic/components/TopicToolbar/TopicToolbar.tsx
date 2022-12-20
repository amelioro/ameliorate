import { Download } from "@mui/icons-material";
import { AppBar, IconButton, Toolbar } from "@mui/material";
import fileDownload from "js-file-download";

import { getState } from "../../store/actions";

// TODO: might be useful to have downloaded state be more human editable;
// for this, probably should prettify the JSON, and remove position values (we can re-layout on import)
const downloadTopic = () => {
  const topicState = getState();
  fileDownload(JSON.stringify(topicState), `${topicState.activeDiagramId}.json`);
};

export const TopicToolbar = () => {
  return (
    <>
      <AppBar position="sticky" color="secondary">
        <Toolbar variant="dense">
          <IconButton color="inherit" onClick={downloadTopic}>
            <Download />
          </IconButton>
        </Toolbar>
      </AppBar>
    </>
  );
};
