import {
  AutoStoriesOutlined,
  Build,
  Close,
  Download,
  Engineering,
  FilterAltOutlined,
  FormatColorFill,
  Image as ImageIcon,
  Info,
  Layers,
  Route,
  Upload,
} from "@mui/icons-material";
import {
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ToggleButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { toPng } from "html-to-image";
import fileDownload from "js-file-download";
import { getRectOfNodes, getTransformForBounds } from "reactflow";
import { StorageValue } from "zustand/middleware";

import { errorWithData } from "../../../../common/errorHandling";
import { NumberInput } from "../../../common/components/NumberInput/NumberInput";
import {
  setLayoutThoroughness,
  toggleFillNodesWithColor,
  toggleForceNodesIntoLayers,
  toggleShowImpliedEdges,
  toggleUnrestrictedEditing,
  useFillNodesWithColor,
  useForceNodesIntoLayers,
  useLayoutThoroughness,
  useShowImpliedEdges,
  useUnrestrictedEditing,
} from "../../../view/actionConfigStore";
import { Perspectives } from "../../../view/components/Perspectives/Perspectives";
import { resetNavigation, useFormat } from "../../../view/navigateStore";
import { migrate } from "../../store/migrate";
import { TopicStoreState } from "../../store/store";
import { useOnPlayground } from "../../store/topicHooks";
import { getPersistState, resetTopicData, setTopicData } from "../../store/utilActions";
import { getTopicTitle } from "../../store/utils";
import { getDisplayNodes } from "../Diagram/externalFlowStore";

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

const imageWidth = 2560;
const imageHeight = 1440;

const downloadScreenshot = () => {
  const nodes = getDisplayNodes();

  // thanks react flow example https://reactflow.dev/examples/misc/download-image
  const nodesBounds = getRectOfNodes(nodes);
  const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);
  const viewportElement = document.querySelector(".react-flow__viewport");
  if (!viewportElement) throw new Error("Couldn't find viewport element to take screenshot of");

  toPng(viewportElement as HTMLElement, {
    backgroundColor: "#fff",
    width: imageWidth,
    height: imageHeight,
    style: {
      width: imageWidth.toString(),
      height: imageHeight.toString(),
      transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
    },
  })
    .then((dataUrl) => {
      const a = document.createElement("a");

      a.setAttribute("download", "topic.png");
      a.setAttribute("href", dataUrl);
      a.click();
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
  const format = useFormat();
  const isTableActive = format === "table";

  const showImpliedEdges = useShowImpliedEdges();
  const unrestrictedEditing = useUnrestrictedEditing();
  const forceNodesIntoLayers = useForceNodesIntoLayers();
  const fillNodesWithColor = useFillNodesWithColor();
  const layoutThoroughness = useLayoutThoroughness();

  return (
    <Drawer
      anchor="left"
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

        {/* actions */}
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
              <IconButton
                color="inherit"
                title="Reset Topic"
                aria-label="Reset Topic"
                onClick={resetTopicData}
              >
                <AutoStoriesOutlined />
              </IconButton>
            </>
          )}

          <IconButton
            color="inherit"
            title="Reset Filters"
            aria-label="Reset Filters"
            onClick={() => resetNavigation(true)}
          >
            <FilterAltOutlined />
          </IconButton>

          {!isTableActive && (
            <IconButton
              color="inherit"
              title="Take Screenshot of Diagram"
              aria-label="Take Screenshot of Diagram"
              onClick={() => downloadScreenshot()}
            >
              <ImageIcon />
            </IconButton>
          )}
        </ListItem>

        <Divider />

        {/* modes */}
        <ListItem disablePadding={false}>
          {userCanEditTopicData && (
            <>
              <ToggleButton
                value={unrestrictedEditing}
                title="Unrestrict editing"
                aria-label="Unrestrict editing"
                color="secondary"
                size="small"
                selected={unrestrictedEditing}
                onClick={() => toggleUnrestrictedEditing(!unrestrictedEditing)}
                sx={{ borderRadius: "50%", border: "0" }}
              >
                <Engineering />
              </ToggleButton>
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
              <ToggleButton
                value={forceNodesIntoLayers}
                title="Force nodes into layers"
                aria-label="Force nodes into layers"
                color="secondary"
                size="small"
                selected={forceNodesIntoLayers}
                onClick={() => toggleForceNodesIntoLayers(!forceNodesIntoLayers)}
                sx={{ borderRadius: "50%", border: "0" }}
              >
                <Layers />
              </ToggleButton>
            </>
          )}

          <ToggleButton
            value={fillNodesWithColor}
            title="Fill nodes with color"
            aria-label="Fill nodes with color"
            color="secondary"
            size="small"
            selected={fillNodesWithColor}
            onClick={() => toggleFillNodesWithColor(!fillNodesWithColor)}
            sx={{ borderRadius: "50%", border: "0" }}
          >
            <FormatColorFill />
          </ToggleButton>
        </ListItem>

        {!isTableActive && (
          <>
            <ListItem disablePadding={false}>
              <Typography variant="body2">Layout Thoroughness</Typography>
              <Tooltip
                title="Determines how much effort the layout algorithm puts into making the diagram look good. 1 = lowest effort, 100 = highest effort."
                enterTouchDelay={0} // allow touch to immediately trigger
                leaveTouchDelay={Infinity} // touch-away to close on mobile, since message is long
              >
                <IconButton
                  color="info"
                  aria-label="Thoroughness info"
                  sx={{
                    // Don't make it look like clicking will do something, since it won't.
                    // Using a button here is an attempt to make it accessible, since the tooltip will show
                    // on focus.
                    cursor: "default",
                    alignSelf: "center",
                  }}
                >
                  <Info />
                </IconButton>
              </Tooltip>
              <NumberInput
                min={1}
                max={100}
                value={layoutThoroughness}
                onChange={(_event, value) => {
                  if (value) setLayoutThoroughness(value);
                }}
              />
            </ListItem>
          </>
        )}

        {!onPlayground && (
          <ListItem disablePadding={false}>
            <Perspectives />
          </ListItem>
        )}
      </List>
    </Drawer>
  );
};
