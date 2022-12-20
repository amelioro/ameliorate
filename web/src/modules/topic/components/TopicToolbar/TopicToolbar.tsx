import { Download, Upload } from "@mui/icons-material";
import { AppBar, IconButton, Toolbar } from "@mui/material";
import fileDownload from "js-file-download";

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

export const TopicToolbar = () => {
  return (
    <>
      <AppBar position="sticky" color="secondary">
        <Toolbar variant="dense">
          <IconButton color="inherit" onClick={downloadTopic}>
            <Download />
          </IconButton>
          <IconButton color="inherit" component="label">
            <Upload />
            <input hidden accept=".json" type="file" onChange={uploadTopic} />
          </IconButton>
        </Toolbar>
      </AppBar>
    </>
  );
};
