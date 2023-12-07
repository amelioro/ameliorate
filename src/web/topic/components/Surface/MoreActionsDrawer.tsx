import { AutoStoriesOutlined, Build, Close, Download, Route, Upload } from "@mui/icons-material";
import {
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ToggleButton,
} from "@mui/material";
import fileDownload from "js-file-download";
import { StorageValue } from "zustand/middleware";

import { errorWithData } from "../../../../common/errorHandling";
import { Perspectives } from "../../../view/components/Perspectives/Perspectives";
import { migrate } from "../../store/migrate";
import { TopicStoreState, useIsTableActive, useShowImpliedEdges } from "../../store/store";
import { useOnPlayground } from "../../store/topicHooks";
import { getPersistState, resetTopicData, setTopicData } from "../../store/utilActions";
import { getTopicTitle } from "../../store/utils";
import { toggleShowImpliedEdges } from "../../store/viewActions";

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

interface Props {
  isMoreActionsDrawerOpen: boolean;
  setIsMoreActionsDrawerOpen: (isOpen: boolean) => void;
  sessionUser?: { username: string } | null;
  userCanEditTopicData: boolean;
}

export const MoreActionsDrawer = ({
  isMoreActionsDrawerOpen,
  setIsMoreActionsDrawerOpen,
  sessionUser,
  userCanEditTopicData,
}: Props) => {
  const onPlayground = useOnPlayground();
  const isTableActive = useIsTableActive();
  const showImpliedEdges = useShowImpliedEdges();

  return (
    <Drawer
      anchor="right"
      open={isMoreActionsDrawerOpen}
      onClose={() => setIsMoreActionsDrawerOpen(false)}
    >
      <List>
        <ListItem
          disablePadding={false}
          secondaryAction={
            <IconButton
              edge="end"
              aria-label="close"
              onClick={() => setIsMoreActionsDrawerOpen(false)}
            >
              <Close />
            </IconButton>
          }
        >
          <ListItemIcon>
            <Build />
          </ListItemIcon>
          <ListItemText primary="More Actions" />
        </ListItem>

        <Divider />

        <ListItem disablePadding={false}>
          <IconButton
            color="inherit"
            title="Download"
            aria-label="Download"
            onClick={downloadTopic}
          >
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
              <IconButton color="inherit" title="Reset" aria-label="Reset" onClick={resetTopicData}>
                <AutoStoriesOutlined />
              </IconButton>
            </>
          )}

          {!isTableActive && (
            <>
              <ToggleButton
                value={showImpliedEdges}
                title="Show implied edges"
                aria-label="Show implied edges"
                color="secondary"
                size="small"
                selected={showImpliedEdges}
                onClick={() => toggleShowImpliedEdges(!showImpliedEdges)}
                sx={{ borderRadius: "50%", border: "0" }}
              >
                <Route />
              </ToggleButton>
            </>
          )}
        </ListItem>

        {!onPlayground && (
          <ListItem disablePadding={false}>
            <Perspectives />
          </ListItem>
        )}
      </List>
    </Drawer>
  );
};
