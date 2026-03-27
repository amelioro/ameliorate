import {
  AlignVerticalCenter,
  ArrowDropDown,
  Delete,
  EditOff,
  FormatLineSpacing,
  Group,
  Highlight,
  MoreVert,
  QuestionMark,
  SelfImprovement,
} from "@mui/icons-material";
import {
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Radio,
  RadioGroup,
  ToggleButton,
} from "@mui/material";
import { startCase } from "es-toolkit";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";

import { FlyoutSubMenu } from "@/web/common/components/Menu/FlyoutSubMenu";
import { Menu } from "@/web/common/components/Menu/Menu";
import { useSessionUser } from "@/web/common/hooks";
import { HelpMenu } from "@/web/topic/components/TopicWorkspace/HelpMenu";
import { MoreActionsMenu } from "@/web/topic/components/TopicWorkspace/MoreActionsMenu";
import { deleteGraphPart } from "@/web/topic/diagramStore/createDeleteActions";
import { useIsTableEdge } from "@/web/topic/diagramStore/edgeHooks";
import { useTopic, useUserCanEditTopicData } from "@/web/topic/topicStore/store";
import { hotkeys } from "@/web/topic/utils/hotkeys";
import { isIndirectEdge } from "@/web/topic/utils/indirectEdges";
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
import { toggleZenMode } from "@/web/view/userConfigStore/store";

const aggregationModeIcons: Record<AggregationMode, ReactNode> = {
  average: <AlignVerticalCenter />,
  disagreement: <FormatLineSpacing />,
};

interface PerspectivesMenuProps {
  anchorEl: HTMLElement | null;
  setAnchorEl: Dispatch<SetStateAction<HTMLElement | null>>;
}

const PerspectivesMenu = ({ anchorEl, setAnchorEl }: PerspectivesMenuProps) => {
  const aggregationMode = useAggregationMode();

  const menuOpen = Boolean(anchorEl);
  if (!menuOpen) return;

  return (
    <Menu
      anchorEl={anchorEl}
      open={menuOpen}
      onClose={() => setAnchorEl(null)}
      closeOnClick={false}
      openDirection="top"
      // match the ~300px width of drawer
      className="w-75 px-2"
    >
      <FlyoutSubMenu label="Aggregation mode" parentMenuOpen={menuOpen} className="mb-2">
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
      </FlyoutSubMenu>

      <Perspectives />
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
  const partIsCalculatedEdge = selectedGraphPart ? isIndirectEdge(selectedGraphPart) : false;

  const [perspectivesMenuAnchorEl, setPerspectivesMenuAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const [helpAnchorEl, setHelpAnchorEl] = useState<null | HTMLElement>(null);
  const [moreMenuAnchorEl, setMoreMenuAnchorEl] = useState<null | HTMLElement>(null);

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
          className="rounded-sm border-none"
        >
          <SelfImprovement />
        </ToggleButton>

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
              className="rounded-sm border-none"
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
              className="w-3 rounded-sm py-2.5 pr-2.5 pl-2"
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
            className="rounded-sm border-none"
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
            className="rounded-sm border-none"
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
                if (selectedGraphPart && !isIndirectEdge(selectedGraphPart)) {
                  deleteGraphPart(selectedGraphPart);
                }
              }}
              // don't allow modifying edges that are part of the table, because they should always exist as long as their nodes do
              // don't allow deleting calculated edges, because they aren't persisted
              disabled={!selectedGraphPart || partIsTableEdge || partIsCalculatedEdge}
              className="rounded-sm"
            >
              <Delete />
            </IconButton>
          </>
        )}

        <Divider orientation="vertical" flexItem />

        <IconButton
          color="inherit"
          title="Help"
          aria-label="Help"
          onClick={(event) => setHelpAnchorEl(event.currentTarget)}
          className="rounded-sm"
        >
          <QuestionMark />
        </IconButton>
        <HelpMenu helpAnchorEl={helpAnchorEl} setHelpAnchorEl={setHelpAnchorEl} />

        {/* show "more" in app header on med+ screens because there's space, otherwise put it in the main toolbar */}
        <div className="contents md:hidden">
          <IconButton
            color="inherit"
            title="More"
            aria-label="More"
            onClick={(event) => setMoreMenuAnchorEl(event.currentTarget)}
            className="rounded-sm"
          >
            <MoreVert />
          </IconButton>
          <MoreActionsMenu
            anchorEl={moreMenuAnchorEl}
            setAnchorEl={setMoreMenuAnchorEl}
            sessionUser={sessionUser}
            userCanEditTopicData={userCanEditTopicData}
            openDirection="top"
          />
        </div>
      </div>
    </div>
  );
};
