import {
  AutoStoriesOutlined,
  Build,
  Close,
  Download,
  EditOff,
  Engineering,
  FilterAltOutlined,
  FormatColorFill,
  Highlight,
  Info,
  Layers,
  PhotoCamera,
  PowerInput,
  Route,
  SsidChart,
  Upload,
  WbTwilight,
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
import { getRectOfNodes, getTransformForBounds } from "reactflow";

import { NumberInput } from "@/web/common/components/NumberInput/NumberInput";
import { getDisplayNodes } from "@/web/topic/components/Diagram/externalFlowStore";
import { downloadTopic, uploadTopic } from "@/web/topic/loadStores";
import { useOnPlayground } from "@/web/topic/store/topicHooks";
import { resetTopicData } from "@/web/topic/store/utilActions";
import { hotkeys } from "@/web/topic/utils/hotkeys";
import {
  toggleFlashlightMode,
  toggleReadonlyMode,
  toggleUnrestrictedEditing,
  useFlashlightMode,
  useReadonlyMode,
  useUnrestrictedEditing,
} from "@/web/view/actionConfigStore";
import { Perspectives } from "@/web/view/components/Perspectives/Perspectives";
import { toggleShowImpliedEdges, useShowImpliedEdges } from "@/web/view/currentViewStore/filter";
import {
  setLayoutThoroughness,
  toggleForceNodesIntoLayers,
  toggleLayerNodeIslandsTogether,
  toggleMinimizeEdgeCrossings,
  useForceNodesIntoLayers,
  useLayerNodeIslandsTogether,
  useLayoutThoroughness,
  useMinimizeEdgeCrossings,
} from "@/web/view/currentViewStore/layout";
import { resetView, useFormat } from "@/web/view/currentViewStore/store";
import { resetQuickViews } from "@/web/view/quickViewStore/store";
import {
  toggleFillNodesWithColor,
  toggleIndicateWhenNodeForcedToShow,
  useFillNodesWithColor,
  useIndicateWhenNodeForcedToShow,
} from "@/web/view/userConfigStore";

const imageWidth = 2560;
const imageHeight = 1440;

const downloadScreenshot = () => {
  const nodes = getDisplayNodes();

  // thanks react flow example https://reactflow.dev/examples/misc/download-image
  const nodesBounds = getRectOfNodes(nodes);
  const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.125, 2);
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
    .catch((error: unknown) => {
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
  const layerNodeIslandsTogether = useLayerNodeIslandsTogether();
  const minimizeEdgeCrossings = useMinimizeEdgeCrossings();
  const flashlightMode = useFlashlightMode();
  const readonlyMode = useReadonlyMode();
  const layoutThoroughness = useLayoutThoroughness();
  const fillNodesWithColor = useFillNodesWithColor();
  const indicateWhenNodeForcedToShow = useIndicateWhenNodeForcedToShow();

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

        <Divider>Actions</Divider>

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
                onClick={() => {
                  resetTopicData();
                  resetQuickViews();
                  // intentionally not resetting comments/drafts, since undoing a reset would be painful if comments were lost,
                  // and it's annoying to try and put these all on the same undo/redo button.
                  // if orphaned comments are really a problem, we should be able to manually clean them up.
                  // if they're routinely a problem, we can consider trying to combining comments/drafts in the same undo/redo stack for this.
                }}
              >
                <AutoStoriesOutlined />
              </IconButton>
            </>
          )}

          <IconButton
            color="inherit"
            title="Reset Filters"
            aria-label="Reset Filters"
            onClick={() => resetView(true)}
          >
            <FilterAltOutlined />
          </IconButton>

          {!isTableActive && (
            <IconButton
              color="inherit"
              title="Download Screenshot of Diagram"
              aria-label="Download Screenshot of Diagram"
              onClick={() => downloadScreenshot()}
            >
              <PhotoCamera />
            </IconButton>
          )}
        </ListItem>

        {!isTableActive && (
          <>
            <Divider>Action Config</Divider>

            <ListItem disablePadding={false}>
              {userCanEditTopicData && (
                <>
                  <ToggleButton
                    value={unrestrictedEditing}
                    title="Unrestrict editing"
                    aria-label="Unrestrict editing"
                    color="primary"
                    size="small"
                    selected={unrestrictedEditing}
                    onClick={() => toggleUnrestrictedEditing(!unrestrictedEditing)}
                    sx={{ borderRadius: "50%", border: "0" }}
                  >
                    <Engineering />
                  </ToggleButton>
                </>
              )}
              <ToggleButton
                value={flashlightMode}
                title="Flashlight mode"
                aria-label="Flashlight mode"
                color="primary"
                size="small"
                selected={flashlightMode}
                onClick={() => toggleFlashlightMode(!flashlightMode)}
                sx={{ borderRadius: "50%", border: "0" }}
              >
                <Highlight />
              </ToggleButton>
              {userCanEditTopicData && (
                <>
                  <ToggleButton
                    value={readonlyMode}
                    title={`Read-only mode (${hotkeys.readonlyMode})`}
                    aria-label={`Read-only mode (${hotkeys.readonlyMode})`}
                    color="primary"
                    size="small"
                    selected={readonlyMode}
                    onClick={() => toggleReadonlyMode()}
                    sx={{ borderRadius: "50%", border: "0" }}
                  >
                    <EditOff />
                  </ToggleButton>
                </>
              )}
            </ListItem>
          </>
        )}

        {!isTableActive && (
          <>
            <Divider>Diagram Config</Divider>

            <ListItem disablePadding={false}>
              <ToggleButton
                value={showImpliedEdges}
                title="Show implied edges"
                aria-label="Show implied edges"
                color="primary"
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
                color="primary"
                size="small"
                selected={forceNodesIntoLayers}
                onClick={() => toggleForceNodesIntoLayers(!forceNodesIntoLayers)}
                sx={{ borderRadius: "50%", border: "0" }}
              >
                <Layers />
              </ToggleButton>
              <ToggleButton
                value={layerNodeIslandsTogether}
                title="Layer node islands together"
                aria-label="Layer node islands together"
                color="primary"
                size="small"
                selected={layerNodeIslandsTogether}
                onClick={() => toggleLayerNodeIslandsTogether(!layerNodeIslandsTogether)}
                sx={{ borderRadius: "50%", border: "0" }}
              >
                <PowerInput />
              </ToggleButton>
              <ToggleButton
                value={minimizeEdgeCrossings}
                title="Minimize edge crossings"
                aria-label="Minimize edge crossings"
                color="primary"
                size="small"
                selected={minimizeEdgeCrossings}
                onClick={() => toggleMinimizeEdgeCrossings(!minimizeEdgeCrossings)}
                sx={{ borderRadius: "50%", border: "0" }}
              >
                <SsidChart />
              </ToggleButton>
            </ListItem>

            <ListItem disablePadding={false}>
              <Typography variant="body2">Layout Thoroughness</Typography>
              <Tooltip
                title="Determines how much effort the layout algorithm puts into laying out nodes such that they efficiently use space. 1 = lowest effort, 100 = highest effort."
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
          <>
            <Divider>Perspectives</Divider>

            <ListItem disablePadding={false}>
              <Perspectives />
            </ListItem>
          </>
        )}

        <Divider>User Config</Divider>

        <ListItem disablePadding={false}>
          <ToggleButton
            value={fillNodesWithColor}
            title="Fill nodes with color"
            aria-label="Fill nodes with color"
            color="primary"
            size="small"
            selected={fillNodesWithColor}
            onClick={() => toggleFillNodesWithColor(!fillNodesWithColor)}
            sx={{ borderRadius: "50%", border: "0" }}
          >
            <FormatColorFill />
          </ToggleButton>
          <ToggleButton
            value={indicateWhenNodeForcedToShow}
            title="Indicate when node forced to show"
            aria-label="Indicate when node forced to show"
            color="primary"
            size="small"
            selected={indicateWhenNodeForcedToShow}
            onClick={() => toggleIndicateWhenNodeForcedToShow(!indicateWhenNodeForcedToShow)}
            sx={{ borderRadius: "50%", border: "0" }}
          >
            <WbTwilight />
          </ToggleButton>
        </ListItem>
      </List>
    </Drawer>
  );
};
