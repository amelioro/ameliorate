import {
  AdsClick,
  AutoAwesomeMotion,
  AutoStories,
  AutoStoriesOutlined,
  Bolt,
  CallMade,
  Dashboard,
  Download,
  EditOff,
  Engineering,
  FilterAltOutlined,
  FormatColorFill,
  Grid4x4,
  Highlight,
  Layers,
  Looks6,
  Navigation,
  PhotoCamera,
  PieChart,
  PowerInput,
  Route,
  Speed,
  SsidChart,
  Tab,
  TabUnselected,
  TableChartOutlined,
  ThumbsUpDown,
  Tune,
  UnfoldMore,
  Upload,
  Visibility,
  WbTwilight,
  WebStories,
} from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Radio,
  RadioGroup,
  Switch,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { type Dispatch, type SetStateAction, useState } from "react";

import { hasComments, resetComments } from "@/web/comment/store/commentStore";
import { HelpIcon } from "@/web/common/components/HelpIcon";
import { Menu } from "@/web/common/components/Menu/Menu";
import { MobileMenuDrawer } from "@/web/common/components/Menu/MobileMenuDrawer";
import { ResponsiveSubMenu } from "@/web/common/components/Menu/ResponsiveSubMenu";
import { IconWithTooltip } from "@/web/common/components/Tooltip/IconWithTooltip";
import { ScreenshotResolutionDialog } from "@/web/topic/components/TopicWorkspace/ScreenshotResolutionDialog";
import { resetDiagramData } from "@/web/topic/diagramStore/utilActions";
import { downloadTopic, uploadTopic } from "@/web/topic/loadStores";
import { hotkeys } from "@/web/topic/utils/hotkeys";
import {
  toggleFlashlightMode,
  toggleReadonlyMode,
  toggleUnrestrictedEditing,
  useFlashlightMode,
  useReadonlyMode,
  useUnrestrictedEditing,
} from "@/web/view/actionConfigStore";
import {
  toggleShowImpliedEdges,
  toggleShowProblemCriterionSolutionEdges,
  useShowImpliedEdges,
  useShowProblemCriterionSolutionEdges,
} from "@/web/view/currentViewStore/filter";
import {
  setLayoutThoroughness,
  toggleAvoidEdgeLabelOverlap,
  toggleForceNodesIntoLayers,
  toggleLayerNodeIslandsTogether,
  toggleMinimizeEdgeCrossings,
  useAvoidEdgeLabelOverlap,
  useForceNodesIntoLayers,
  useLayerNodeIslandsTogether,
  useLayoutThoroughness,
  useMinimizeEdgeCrossings,
} from "@/web/view/currentViewStore/layout";
import { resetView, useFormat } from "@/web/view/currentViewStore/store";
import { resetQuickViews } from "@/web/view/quickViewStore/store";
import {
  setWhenToShowIndicators,
  toggleEnableContentIndicators,
  toggleEnableForceShownIndicators,
  toggleEnableScoresToShow,
  toggleEnableSemanticArrowShapes,
  toggleEnableViewIndicators,
  toggleExpandAddNodeButtons,
  toggleExpandDetailsTabs,
  toggleFillNodeAttachmentWithColor,
  toggleFillNodesWithColor,
  toggleQuickScoring,
  useEnableContentIndicators,
  useEnableForceShownIndicators,
  useEnableScoresToShow,
  useEnableSemanticArrowShapes,
  useEnableViewIndicators,
  useExpandAddNodeButtons,
  useExpandDetailsTabs,
  useFillNodeAttachmentWithColor,
  useFillNodesWithColor,
  useQuickScoring,
  useWhenToShowIndicators,
} from "@/web/view/userConfigStore/store";

interface Props {
  anchorEl: HTMLElement | null;
  setAnchorEl: Dispatch<SetStateAction<HTMLElement | null>>;
  sessionUser?: { username: string } | null;
  userCanEditTopicData: boolean;
  openDirection?: "top" | "bottom";
}

export const MoreActionsMenu = ({
  anchorEl,
  setAnchorEl,
  sessionUser,
  userCanEditTopicData,
  openDirection,
}: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const menuOpen = Boolean(anchorEl);
  const handleClose = () => setAnchorEl(null);

  const format = useFormat();
  const isTableActive = format === "table";

  // Using an array (not a Fragment) because MUI's Menu errors on Fragment children.
  const menuContent = [
    <TopicSubmenu
      key="topic"
      menuOpen={menuOpen}
      handleClose={handleClose}
      sessionUser={sessionUser}
      userCanEditTopicData={userCanEditTopicData}
      isTableActive={isTableActive}
    />,

    !isTableActive && (
      <ModesSubmenu key="modes" menuOpen={menuOpen} userCanEditTopicData={userCanEditTopicData} />
    ),

    <PreferencesSubmenu key="preferences" menuOpen={menuOpen} />,

    !isTableActive && <Divider key="divider" className="my-1" />,

    !isTableActive && <LayoutSubmenu key="layout" menuOpen={menuOpen} />,

    !isTableActive && <FilterSubmenu key="filter" menuOpen={menuOpen} />,
  ];

  if (isMobile) {
    return (
      <MobileMenuDrawer
        open={menuOpen}
        onClose={handleClose}
        slotProps={{ list: { dense: false } }} // give our More MenuItems a bit more breathing space because many of them have sizable icons like switches/radios
      >
        {menuContent}
      </MobileMenuDrawer>
    );
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={menuOpen}
      onClose={handleClose}
      closeOnClick={false}
      openDirection={openDirection}
      slotProps={{ list: { dense: false } }} // give our More MenuItems a bit more breathing space because many of them have sizable icons like switches/radios
    >
      {menuContent}
    </Menu>
  );
};

interface TopicSubmenuProps {
  menuOpen: boolean;
  handleClose: () => void;
  sessionUser?: { username: string } | null;
  userCanEditTopicData: boolean;
  isTableActive: boolean;
}

const TopicSubmenu = ({
  menuOpen,
  handleClose,
  sessionUser,
  userCanEditTopicData,
  isTableActive,
}: TopicSubmenuProps) => {
  const [screenshotDialogOpen, setScreenshotDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  return (
    <>
      <ResponsiveSubMenu
        label="Topic"
        leftIcon={<AutoStories />}
        parentMenuOpen={menuOpen}
        slotProps={{ list: { dense: false } }} // give our More MenuItems a bit more breathing space because many of them have sizable icons like switches/radios
      >
        <MenuItem
          onClick={() => {
            downloadTopic();
            handleClose();
          }}
        >
          <ListItemIcon>
            <Download />
          </ListItemIcon>
          <ListItemText primary="Download" />
        </MenuItem>

        <MenuItem component="label" disabled={!userCanEditTopicData}>
          <ListItemIcon>
            <Upload />
          </ListItemIcon>
          <ListItemText primary="Upload" />
          <input
            hidden
            accept=".json"
            type="file"
            disabled={!userCanEditTopicData}
            onChange={(event) => {
              void uploadTopic(event, sessionUser?.username);
              handleClose();
            }}
          />
        </MenuItem>

        {!isTableActive && (
          <MenuItem
            onClick={() => {
              setScreenshotDialogOpen(true);
            }}
          >
            <ListItemIcon>
              <PhotoCamera />
            </ListItemIcon>
            <ListItemText primary="Screenshot" />
          </MenuItem>
        )}

        <Divider className="my-1" />

        <MenuItem
          disabled={!userCanEditTopicData}
          onClick={() => {
            if (hasComments()) {
              setResetDialogOpen(true);
            } else {
              resetDiagramData();
              resetQuickViews();
              handleClose();
            }
          }}
        >
          <ListItemIcon>
            <AutoStoriesOutlined />
          </ListItemIcon>
          <ListItemText primary="Reset topic" />
        </MenuItem>

        <MenuItem
          onClick={() => {
            resetView(true);
            handleClose();
          }}
        >
          <ListItemIcon>
            <FilterAltOutlined />
          </ListItemIcon>
          <ListItemText primary="Reset layout & filter" />
        </MenuItem>
      </ResponsiveSubMenu>

      <ScreenshotResolutionDialog
        screenshotDialogOpen={screenshotDialogOpen}
        setScreenshotDialogOpen={setScreenshotDialogOpen}
      />

      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        aria-labelledby="reset-dialog-title"
      >
        <DialogTitle id="reset-dialog-title">Reset Topic</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This topic contains comments that will be removed with this action, and undoing will not
            bring them back. Do you want to proceed with the reset?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setResetDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              setResetDialogOpen(false);
              resetComments();
              resetDiagramData();
              resetQuickViews();
              handleClose();
            }}
          >
            Reset Topic
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

interface ModesSubmenuProps {
  menuOpen: boolean;
  userCanEditTopicData: boolean;
}

const ModesSubmenu = ({ menuOpen, userCanEditTopicData }: ModesSubmenuProps) => {
  const quickScoring = useQuickScoring();
  const unrestrictedEditing = useUnrestrictedEditing();
  const flashlightMode = useFlashlightMode();
  const readonlyMode = useReadonlyMode();

  return (
    <ResponsiveSubMenu
      label="Modes"
      leftIcon={<Engineering />}
      parentMenuOpen={menuOpen}
      slotProps={{ list: { dense: false } }} // give our More MenuItems a bit more breathing space because many of them have sizable icons like switches/radios
    >
      <MenuItem onClick={() => toggleQuickScoring()}>
        <ListItemIcon>
          <Bolt />
        </ListItemIcon>
        <ListItemText
          primary={
            <span className="flex items-center gap-1">
              Quick scoring
              <IconWithTooltip
                tooltipHeading="Quick Scoring"
                tooltipBody="Quick scoring allows you to set scores more quickly by showing score pies when hovering a score. This isn't on all the time because it can be annoying to see the score pies when you're not intending to score."
                icon={<HelpIcon />}
              />
            </span>
          }
        />
        <Switch
          checked={quickScoring}
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-none"
        />
      </MenuItem>

      <MenuItem
        disabled={!userCanEditTopicData}
        onClick={() => toggleUnrestrictedEditing(!unrestrictedEditing)}
      >
        <ListItemIcon>
          <Engineering />
        </ListItemIcon>
        <ListItemText primary="Unrestrict editing" />
        <Switch
          checked={unrestrictedEditing}
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-none"
        />
      </MenuItem>

      <MenuItem onClick={() => toggleFlashlightMode(!flashlightMode)}>
        <ListItemIcon>
          <Highlight />
        </ListItemIcon>
        <ListItemText primary="Flashlight mode" />
        <Switch
          checked={flashlightMode}
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-none"
        />
      </MenuItem>

      <MenuItem
        // keep readonly mode menu item enabled and clickable if readonly mode is on, so that we can disable it
        disabled={!readonlyMode && !userCanEditTopicData}
        onClick={() => toggleReadonlyMode()}
      >
        <ListItemIcon>
          <EditOff />
        </ListItemIcon>
        <ListItemText
          primary={
            <>
              Read-only mode{" "}
              <span className="pl-1 text-text-secondary">{hotkeys.readonlyMode}</span>
            </>
          }
        />
        <Switch
          checked={readonlyMode}
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-none"
        />
      </MenuItem>
    </ResponsiveSubMenu>
  );
};

interface PreferencesSubmenuProps {
  menuOpen: boolean;
}

const PreferencesSubmenu = ({ menuOpen }: PreferencesSubmenuProps) => {
  const whenToShowIndicators = useWhenToShowIndicators();
  const enableScoresToShow = useEnableScoresToShow();
  const enableContentIndicators = useEnableContentIndicators();
  const enableViewIndicators = useEnableViewIndicators();
  const enableForceShownIndicators = useEnableForceShownIndicators();

  const enableSemanticArrowShapes = useEnableSemanticArrowShapes();
  const fillNodesWithColor = useFillNodesWithColor();
  const fillNodeAttachmentWithColor = useFillNodeAttachmentWithColor();
  const expandDetailsTabs = useExpandDetailsTabs();
  const expandAddNodeButtons = useExpandAddNodeButtons();

  return (
    <ResponsiveSubMenu
      label="Preferences"
      leftIcon={<Tune />}
      parentMenuOpen={menuOpen}
      slotProps={{ list: { dense: false } }} // give our More MenuItems a bit more breathing space because many of them have sizable icons like switches/radios
    >
      <ResponsiveSubMenu
        parentMenuOpen={menuOpen}
        leftIcon={<TabUnselected />}
        label="Indicators"
        slotProps={{ list: { dense: false } }} // give our More MenuItems a bit more breathing space because many of them have sizable icons like switches/radios
      >
        <RadioGroup
          name="when to show indicators"
          value={whenToShowIndicators}
          onChange={(_, value) => setWhenToShowIndicators(value as "always" | "onHoverOrSelect")}
        >
          <MenuItem component="label">
            <ListItemIcon>
              <Visibility />
            </ListItemIcon>
            <ListItemText primary="Always show" />
            <Radio value="always" />
          </MenuItem>

          <MenuItem component="label">
            <ListItemIcon>
              <AdsClick />
            </ListItemIcon>
            <ListItemText primary="Show on hover or select" />
            <Radio value="onHoverOrSelect" />
          </MenuItem>
        </RadioGroup>

        <Divider className="my-1" />

        <MenuItem onClick={() => toggleEnableScoresToShow()}>
          <ListItemIcon>
            <Looks6 />
          </ListItemIcon>
          <ListItemText primary="Enable scores to show" />
          <Switch
            checked={enableScoresToShow}
            onClick={(e) => e.stopPropagation()} // for some reason the parent MenuItem click gets doubled if we don't stopPropagation
            className="pointer-events-none"
          />
        </MenuItem>

        <MenuItem onClick={() => toggleEnableContentIndicators()}>
          <ListItemIcon>
            <ThumbsUpDown />
          </ListItemIcon>
          <ListItemText primary="Enable content indicators" />
          <Switch
            checked={enableContentIndicators}
            onClick={(e) => e.stopPropagation()} // for some reason the parent MenuItem click gets doubled if we don't stopPropagation
            className="pointer-events-none"
          />
        </MenuItem>

        <MenuItem onClick={() => toggleEnableViewIndicators()}>
          <ListItemIcon>
            <TableChartOutlined />
          </ListItemIcon>
          <ListItemText primary="Enable view indicators" />
          <Switch
            checked={enableViewIndicators}
            onClick={(e) => e.stopPropagation()} // for some reason the parent MenuItem click gets doubled if we don't stopPropagation
            className="pointer-events-none"
          />
        </MenuItem>

        <MenuItem onClick={() => toggleEnableForceShownIndicators()}>
          <ListItemIcon>
            <WbTwilight />
          </ListItemIcon>
          <ListItemText primary="Enable force shown indicators" />
          <Switch
            checked={enableForceShownIndicators}
            onClick={(e) => e.stopPropagation()} // for some reason the parent MenuItem click gets doubled if we don't stopPropagation
            className="pointer-events-none"
          />
        </MenuItem>
      </ResponsiveSubMenu>

      <ResponsiveSubMenu
        parentMenuOpen={menuOpen}
        leftIcon={<Tab />}
        label="Nodes"
        slotProps={{ list: { dense: false } }} // give our More MenuItems a bit more breathing space because many of them have sizable icons like switches/radios
      >
        <MenuItem onClick={() => toggleFillNodesWithColor(!fillNodesWithColor)}>
          <ListItemIcon>
            <FormatColorFill />
          </ListItemIcon>
          <ListItemText primary="Fill nodes with color" />
          <Switch
            checked={fillNodesWithColor}
            onClick={(e) => e.stopPropagation()}
            className="pointer-events-none"
          />
        </MenuItem>

        <MenuItem onClick={() => toggleFillNodeAttachmentWithColor(!fillNodeAttachmentWithColor)}>
          <ListItemIcon>
            <PieChart />
          </ListItemIcon>
          <ListItemText primary="Fill node attachment with color" />
          <Switch
            checked={fillNodeAttachmentWithColor}
            onClick={(e) => e.stopPropagation()}
            className="pointer-events-none"
          />
        </MenuItem>

        <MenuItem onClick={() => toggleExpandAddNodeButtons()}>
          <ListItemIcon>
            <WebStories />
          </ListItemIcon>
          <ListItemText primary="Expand add node buttons" />
          <Switch
            checked={expandAddNodeButtons}
            onClick={(e) => e.stopPropagation()}
            className="pointer-events-none"
          />
        </MenuItem>
      </ResponsiveSubMenu>

      <ResponsiveSubMenu
        parentMenuOpen={menuOpen}
        leftIcon={<CallMade />}
        label="Edges"
        slotProps={{ list: { dense: false } }} // give our More MenuItems a bit more breathing space because many of them have sizable icons like switches/radios
      >
        <MenuItem onClick={() => toggleEnableSemanticArrowShapes()}>
          <ListItemIcon>
            <Navigation />
          </ListItemIcon>
          <ListItemText primary="Use semantic arrow shapes" />
          <Switch
            checked={enableSemanticArrowShapes}
            onClick={(e) => e.stopPropagation()}
            className="pointer-events-none"
          />
        </MenuItem>
      </ResponsiveSubMenu>

      <MenuItem onClick={() => toggleExpandDetailsTabs()}>
        <ListItemIcon>
          <UnfoldMore />
        </ListItemIcon>
        <ListItemText primary="Expand details tabs" />
        <Switch
          checked={expandDetailsTabs}
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-none"
        />
      </MenuItem>
    </ResponsiveSubMenu>
  );
};

const LayoutSubmenu = ({ menuOpen }: { menuOpen: boolean }) => {
  const forceNodesIntoLayers = useForceNodesIntoLayers();
  const layerNodeIslandsTogether = useLayerNodeIslandsTogether();
  const minimizeEdgeCrossings = useMinimizeEdgeCrossings();
  const avoidEdgeLabelOverlap = useAvoidEdgeLabelOverlap();
  const layoutThoroughness = useLayoutThoroughness();

  return (
    <ResponsiveSubMenu
      label="Layout"
      leftIcon={<Dashboard />}
      parentMenuOpen={menuOpen}
      slotProps={{ list: { dense: false } }} // give our More MenuItems a bit more breathing space because many of them have sizable icons like switches/radios
    >
      <MenuItem onClick={() => toggleForceNodesIntoLayers(!forceNodesIntoLayers)}>
        <ListItemIcon>
          <Layers />
        </ListItemIcon>
        <ListItemText primary="Force nodes into layers" />
        <Switch
          checked={forceNodesIntoLayers}
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-none"
        />
      </MenuItem>

      <MenuItem onClick={() => toggleLayerNodeIslandsTogether(!layerNodeIslandsTogether)}>
        <ListItemIcon>
          <PowerInput />
        </ListItemIcon>
        <ListItemText primary="Layer node islands together" />
        <Switch
          checked={layerNodeIslandsTogether}
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-none"
        />
      </MenuItem>

      <MenuItem onClick={() => toggleMinimizeEdgeCrossings(!minimizeEdgeCrossings)}>
        <ListItemIcon>
          <SsidChart />
        </ListItemIcon>
        <ListItemText primary="Minimize edge crossings" />
        <Switch
          checked={minimizeEdgeCrossings}
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-none"
        />
      </MenuItem>

      <MenuItem onClick={() => toggleAvoidEdgeLabelOverlap(!avoidEdgeLabelOverlap)}>
        <ListItemIcon>
          <AutoAwesomeMotion />
        </ListItemIcon>
        <ListItemText primary="Avoid edge label overlap" />
        <Switch
          checked={avoidEdgeLabelOverlap}
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-none"
        />
      </MenuItem>

      <Divider className="my-1" />

      <ResponsiveSubMenu
        parentMenuOpen={menuOpen}
        leftIcon={<Speed />}
        id="Thoroughness"
        slotProps={{ list: { dense: false } }} // give our More MenuItems a bit more breathing space because many of them have sizable icons like switches/radios
        renderLabel={() => (
          <span className="flex items-center gap-1">
            Thoroughness
            <IconWithTooltip
              tooltipHeading="Thoroughness"
              tooltipBody="Determines how much effort the layout algorithm puts into laying out nodes such that they efficiently use space. Low = minimal effort, High = maximum effort."
              icon={<HelpIcon />}
            />
          </span>
        )}
      >
        <RadioGroup
          name="layout thoroughness"
          value={layoutThoroughness}
          onChange={(_, value) => setLayoutThoroughness(Number(value))}
        >
          <MenuItem component="label">
            <ListItemText primary="Low" />
            <Radio value={1} />
          </MenuItem>

          <MenuItem component="label">
            <ListItemText primary="Medium" />
            <Radio value={10} />
          </MenuItem>

          <MenuItem component="label">
            <ListItemText primary="High" />
            <Radio value={100} />
          </MenuItem>
        </RadioGroup>
      </ResponsiveSubMenu>
    </ResponsiveSubMenu>
  );
};

const FilterSubmenu = ({ menuOpen }: { menuOpen: boolean }) => {
  const showImpliedEdges = useShowImpliedEdges();
  const showProblemCriterionSolutionEdges = useShowProblemCriterionSolutionEdges();

  return (
    <ResponsiveSubMenu
      label="Filter"
      leftIcon={<FilterAltOutlined />}
      parentMenuOpen={menuOpen}
      slotProps={{ list: { dense: false } }} // give our More MenuItems a bit more breathing space because many of them have sizable icons like switches/radios
    >
      <MenuItem onClick={() => toggleShowImpliedEdges(!showImpliedEdges)}>
        <ListItemIcon>
          <Route />
        </ListItemIcon>
        <ListItemText primary="Show implied edges" />
        <Switch
          checked={showImpliedEdges}
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-none"
        />
      </MenuItem>

      <MenuItem
        onClick={() => toggleShowProblemCriterionSolutionEdges(!showProblemCriterionSolutionEdges)}
      >
        <ListItemIcon>
          <Grid4x4 />
        </ListItemIcon>
        <ListItemText primary="Show problem-criterion-solution edges" />
        <Switch
          checked={showProblemCriterionSolutionEdges}
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-none"
        />
      </MenuItem>
    </ResponsiveSubMenu>
  );
};
