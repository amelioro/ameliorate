import {
  AlignVerticalCenter,
  ArrowDropDown,
  Build,
  Delete,
  EditOff,
  FiberManualRecord,
  FormatLineSpacing,
  Group,
  HelpOutline,
  Highlight,
  Looks6,
  QuestionMark,
  SelfImprovement,
  TabUnselected,
  TableChartOutlined,
  ThumbsUpDown,
  WbTwilight,
} from "@mui/icons-material";
import {
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Radio,
  RadioGroup,
  Switch,
  ToggleButton,
} from "@mui/material";
import { startCase } from "es-toolkit";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";

import { Menu } from "@/web/common/components/Menu/Menu";
import { NestedMenuItem } from "@/web/common/components/Menu/NestedMenuItem";
import { IconWithTooltip } from "@/web/common/components/Tooltip/IconWithTooltip";
import { useSessionUser } from "@/web/common/hooks";
import { HelpMenu } from "@/web/topic/components/TopicWorkspace/HelpMenu";
import { MoreActionsDrawer } from "@/web/topic/components/TopicWorkspace/MoreActionsDrawer";
import { deleteGraphPart } from "@/web/topic/diagramStore/createDeleteActions";
import { useIsTableEdge } from "@/web/topic/diagramStore/edgeHooks";
import { useTopic, useUserCanEditTopicData } from "@/web/topic/topicStore/store";
import { hotkeys } from "@/web/topic/utils/hotkeys";
import { AggregationMode, aggregationModes } from "@/web/topic/utils/score";
import {
  toggleFlashlightMode,
  toggleReadonlyMode,
  useFlashlightMode,
  useReadonlyMode,
} from "@/web/view/actionConfigStore";
import { Perspectives } from "@/web/view/components/Perspectives/Perspectives";
import {
  comparePerspectives,
  resetPerspectives,
  setAggregationMode,
  useAggregationMode,
  useIsComparingPerspectives,
} from "@/web/view/perspectiveStore";
import { useSelectedGraphPart } from "@/web/view/selectedPartStore";
import {
  toggleIndicateWhenNodeForcedToShow,
  toggleQuickScoring,
  toggleShowContentIndicators,
  toggleShowNeighborIndicators,
  toggleShowScores,
  toggleShowViewIndicators,
  toggleZenMode,
  useIndicateWhenNodeForcedToShow,
  useQuickScoring,
  useShowContentIndicators,
  useShowNeighborIndicators,
  useShowScores,
  useShowViewIndicators,
} from "@/web/view/userConfigStore";

const aggregationModeIcons: Record<AggregationMode, ReactNode> = {
  average: <AlignVerticalCenter />,
  disagreement: <FormatLineSpacing />,
};

const QuickScoringHelpIcon = () => {
  return (
    <IconWithTooltip
      tooltipHeading="Quick scoring allows you to set scores more quickly by showing score pies when hovering a score. This isn't on all the time because it can be annoying to see the score pies when you're not intending to score."
      icon={<HelpOutline className="text-[rgba(0,0,0,0.6)]" />}
    />
  );
};

interface PerspectivesMenuProps {
  anchorEl: HTMLElement | null;
  setAnchorEl: Dispatch<SetStateAction<HTMLElement | null>>;
}

const PerspectivesMenu = ({ anchorEl, setAnchorEl }: PerspectivesMenuProps) => {
  const quickScoring = useQuickScoring();
  const aggregationMode = useAggregationMode();

  const menuOpen = Boolean(anchorEl);
  if (!menuOpen) return;

  return (
    <Menu
      anchorEl={anchorEl}
      isOpen={menuOpen}
      closeMenu={() => setAnchorEl(null)}
      closeOnClick={false}
      openDirection="top"
      // match the ~300px width of drawer
      className="w-[18.75rem] px-2"
    >
      <MenuItem onClick={() => toggleQuickScoring()}>
        <ListItemText
          primary={
            <span className="flex items-center gap-1">
              Quick scoring <QuickScoringHelpIcon />
            </span>
          }
        />
        <Switch
          checked={quickScoring}
          // for some reason the parent MenuItem click gets doubled if we don't stopPropagation
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-none"
        />
      </MenuItem>

      <NestedMenuItem label="Aggregation mode" parentMenuOpen={menuOpen} className="mb-2">
        <RadioGroup name="aggregation mode">
          {aggregationModes.map((mode) => {
            return (
              <MenuItem key={mode} onClick={() => setAggregationMode(mode)}>
                <ListItemIcon>{aggregationModeIcons[mode]}</ListItemIcon>
                <ListItemText primary={startCase(mode)} />
                <Radio checked={aggregationMode === mode} value={mode} name="aggregation mode" />
              </MenuItem>
            );
          })}
        </RadioGroup>
      </NestedMenuItem>

      <Perspectives />
    </Menu>
  );
};

interface ShowHideMenuProps {
  anchorEl: HTMLElement | null;
  setAnchorEl: Dispatch<SetStateAction<HTMLElement | null>>;
}

const ShowHideMenu = ({ anchorEl, setAnchorEl }: ShowHideMenuProps) => {
  const showScores = useShowScores();
  const showContentIndicators = useShowContentIndicators();
  const showNeighborIndicators = useShowNeighborIndicators();
  const showViewIndicators = useShowViewIndicators();
  const indicateWhenNodeForcedToShow = useIndicateWhenNodeForcedToShow();

  const menuOpen = Boolean(anchorEl);
  if (!menuOpen) return;

  return (
    <Menu
      anchorEl={anchorEl}
      isOpen={menuOpen}
      closeMenu={() => setAnchorEl(null)}
      closeOnClick={false}
      openDirection="top"
    >
      <MenuItem onClick={() => toggleShowScores()}>
        <ListItemIcon>
          <Looks6 />
        </ListItemIcon>
        <ListItemText primary="Show scores" />
        <Switch
          checked={showScores}
          // for some reason the parent MenuItem click gets doubled if we don't stopPropagation
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-none"
        />
      </MenuItem>
      <MenuItem onClick={() => toggleShowContentIndicators()}>
        <ListItemIcon>
          <ThumbsUpDown />
        </ListItemIcon>
        <ListItemText primary="Show content indicators" />
        <Switch
          checked={showContentIndicators}
          // for some reason the parent MenuItem click gets doubled if we don't stopPropagation
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-none"
        />
      </MenuItem>
      <MenuItem onClick={() => toggleShowNeighborIndicators()}>
        <ListItemIcon>
          <FiberManualRecord />
        </ListItemIcon>
        <ListItemText primary="Show neighbor indicators" />
        <Switch
          checked={showNeighborIndicators}
          // for some reason the parent MenuItem click gets doubled if we don't stopPropagation
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-none"
        />
      </MenuItem>
      <MenuItem onClick={() => toggleShowViewIndicators()}>
        <ListItemIcon>
          <TableChartOutlined />
        </ListItemIcon>
        <ListItemText primary="Show view indicators" />
        <Switch
          checked={showViewIndicators}
          // for some reason the parent MenuItem click gets doubled if we don't stopPropagation
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-none"
        />
      </MenuItem>
      <MenuItem onClick={() => toggleIndicateWhenNodeForcedToShow()}>
        <ListItemIcon>
          <WbTwilight />
        </ListItemIcon>
        <ListItemText primary="Show force shown indicators" />
        <Switch
          checked={indicateWhenNodeForcedToShow}
          // for some reason the parent MenuItem click gets doubled if we don't stopPropagation
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-none"
        />
      </MenuItem>
    </Menu>
  );
};

export const MainToolbar = () => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const topic = useTopic();
  const onPlayground = topic.id === undefined;

  const isComparingPerspectives = useIsComparingPerspectives();
  const flashlightMode = useFlashlightMode();
  const readonlyMode = useReadonlyMode();

  const selectedGraphPart = useSelectedGraphPart();
  const partIsTableEdge = useIsTableEdge(selectedGraphPart?.id ?? "");

  const [showHideMenuAnchorEl, setShowHideMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [perspectivesMenuAnchorEl, setPerspectivesMenuAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const [isMoreActionsDrawerOpen, setIsMoreActionsDrawerOpen] = useState(false);
  const [helpAnchorEl, setHelpAnchorEl] = useState<null | HTMLElement>(null);

  return (
    // Toolbar buttons have square-rounding to fit more snuggly into the toolbar.
    // Potentially could make all icon buttons match this but they seem ok as the default full-rounded.
    <div className="flex w-full justify-center border-t bg-paperShaded-main">
      <div className="flex border-x">
        <ToggleButton
          value={false}
          selected={false}
          title="Zen mode"
          aria-label="Zen mode"
          color="primary"
          size="small"
          onClick={() => toggleZenMode()}
          className="rounded border-none"
        >
          <SelfImprovement />
        </ToggleButton>

        <IconButton
          title="Show/hide menu"
          aria-label="Show/hide menu"
          color="inherit"
          size="small"
          onClick={(event) => setShowHideMenuAnchorEl(event.currentTarget)}
          // pr-0 because the dropdown arrow has a bunch of extra space
          className="rounded border-none pr-0"
        >
          <TabUnselected />
          <ArrowDropDown fontSize="small" />
        </IconButton>
        <ShowHideMenu anchorEl={showHideMenuAnchorEl} setAnchorEl={setShowHideMenuAnchorEl} />

        {!onPlayground && (
          <>
            <ToggleButton
              value={isComparingPerspectives}
              title="Compare perspectives"
              aria-label="Compare perspectives"
              color="primary"
              size="small"
              selected={isComparingPerspectives}
              onClick={() =>
                isComparingPerspectives ? resetPerspectives() : comparePerspectives()
              }
              className="rounded border-none"
            >
              <Group />
            </ToggleButton>

            <IconButton
              color="inherit"
              title="Perspectives menu"
              aria-label="Perspectives menu"
              onClick={(event) => setPerspectivesMenuAnchorEl(event.currentTarget)}
              // small width to keep the menu button narrow
              // extra right padding because otherwise icon is too close to right-divider
              // extra y padding to match other icon buttons with default fontSize="medium"
              className="w-3 rounded py-2.5 pl-2 pr-2.5"
            >
              <ArrowDropDown fontSize="small" />
            </IconButton>
            <PerspectivesMenu
              anchorEl={perspectivesMenuAnchorEl}
              setAnchorEl={setPerspectivesMenuAnchorEl}
            />
          </>
        )}

        {/* TODO?: seems a bit awkward to only show when flashlight mode is on, but it's more awkward */}
        {/* if we have no way of telling that it's on when we're clicking around the diagram */}
        {flashlightMode && (
          <ToggleButton
            value={flashlightMode}
            title="Flashlight mode"
            aria-label="Flashlight mode"
            color="primary"
            size="small"
            selected={flashlightMode}
            onClick={() => toggleFlashlightMode(!flashlightMode)}
            className="rounded border-none"
          >
            <Highlight />
          </ToggleButton>
        )}

        {readonlyMode && (
          <ToggleButton
            value={readonlyMode}
            title={`Read-only mode (${hotkeys.readonlyMode})`}
            aria-label={`Read-only mode (${hotkeys.readonlyMode})`}
            color="primary"
            size="small"
            selected={readonlyMode}
            onClick={() => toggleReadonlyMode()}
            className="rounded border-none"
          >
            <EditOff />
          </ToggleButton>
        )}

        {userCanEditTopicData && (
          <>
            <Divider orientation="vertical" flexItem />

            <IconButton
              color="inherit"
              title="Delete"
              aria-label="Delete"
              onClick={() => {
                if (selectedGraphPart) {
                  deleteGraphPart(selectedGraphPart);
                }
              }}
              // don't allow modifying edges that are part of the table, because they should always exist as long as their nodes do
              disabled={!selectedGraphPart || partIsTableEdge}
              className="rounded"
            >
              <Delete />
            </IconButton>
          </>
        )}

        <Divider orientation="vertical" flexItem />

        <IconButton
          color="inherit"
          title="More actions"
          aria-label="More actions"
          onClick={() => setIsMoreActionsDrawerOpen(true)}
          className="rounded"
        >
          <Build />
        </IconButton>
        <MoreActionsDrawer
          isMoreActionsDrawerOpen={isMoreActionsDrawerOpen}
          setIsMoreActionsDrawerOpen={setIsMoreActionsDrawerOpen}
          sessionUser={sessionUser}
          userCanEditTopicData={userCanEditTopicData}
        />

        <IconButton
          color="inherit"
          title="Help"
          aria-label="Help"
          onClick={(event) => setHelpAnchorEl(event.currentTarget)}
          className="rounded"
        >
          <QuestionMark />
        </IconButton>
        <HelpMenu helpAnchorEl={helpAnchorEl} setHelpAnchorEl={setHelpAnchorEl} />
      </div>
    </div>
  );
};
