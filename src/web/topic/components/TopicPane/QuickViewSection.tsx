import {
  Add,
  Delete,
  Edit,
  KeyboardDoubleArrowDown,
  KeyboardDoubleArrowUp,
  MoreVert,
  Redo,
  Save,
  Undo,
  Visibility,
} from "@mui/icons-material";
import {
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
} from "@mui/material";
import { useState } from "react";

import { CloseOnClickMenuItem } from "@/web/common/components/ContextMenu/CloseOnClickMenuItem";
import { useSessionUser } from "@/web/common/hooks";
import { QuickViewForm } from "@/web/topic/components/TopicPane/QuickViewForm";
import { useUserCanEditTopicData } from "@/web/topic/topicStore/store";
import {
  QuickView,
  createView,
  deleteView,
  moveView,
  redo,
  saveView,
  selectView,
  undo,
  useCanUndoRedo,
  useQuickViews,
  useSelectedViewId,
} from "@/web/view/quickViewStore/store";

interface RowProps {
  view: QuickView;
  selected: boolean;
  editable: boolean;
  onEdit: () => void;
}

const QuickViewRow = ({ view, selected, editable, onEdit }: RowProps) => {
  const [actionsMenuAnchorEl, setActionsMenuAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <>
      <ListItem key={view.id}>
        <ListItemButton
          selected={selected}
          onClick={() => selectView(view.id)}
          sx={{ paddingY: 0, height: "40px" }} // icon buttons have padding, so this extra padding isn't necessary, and use a consistent height whether or not icon buttons are showing
        >
          <ListItemIcon>
            <Visibility />
          </ListItemIcon>

          <ListItemText primary={view.title} className="[&>span]:truncate" />

          {editable && (
            <IconButton
              color="inherit"
              title="More Actions"
              aria-label="More Actions"
              onClick={(e) => {
                setActionsMenuAnchorEl(e.currentTarget);
              }}
            >
              <MoreVert />
            </IconButton>
          )}
        </ListItemButton>
      </ListItem>

      {editable && (
        <Menu
          anchorEl={actionsMenuAnchorEl}
          open={Boolean(actionsMenuAnchorEl)}
          onClose={() => setActionsMenuAnchorEl(null)}
        >
          <CloseOnClickMenuItem
            onClick={() => moveView(view.id, "up")}
            closeMenu={() => setActionsMenuAnchorEl(null)}
          >
            <ListItemIcon>
              <KeyboardDoubleArrowUp fontSize="small" />
            </ListItemIcon>
            <ListItemText>Move up</ListItemText>
          </CloseOnClickMenuItem>

          <CloseOnClickMenuItem
            onClick={() => moveView(view.id, "down")}
            closeMenu={() => setActionsMenuAnchorEl(null)}
          >
            <ListItemIcon>
              <KeyboardDoubleArrowDown fontSize="small" />
            </ListItemIcon>
            <ListItemText>Move down</ListItemText>
          </CloseOnClickMenuItem>

          <CloseOnClickMenuItem
            onClick={() => onEdit()}
            closeMenu={() => setActionsMenuAnchorEl(null)}
          >
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </CloseOnClickMenuItem>

          <CloseOnClickMenuItem
            disabled={selected}
            // Assumes that the selected view is being displayed, so saving wouldn't do anything.
            // Could be more accurate by checking if this index's view state deep equals the current view state... but that seems overkill performance-wise.
            onClick={() => saveView(view.id)}
            closeMenu={() => setActionsMenuAnchorEl(null)}
          >
            <ListItemIcon>
              <Save fontSize="small" />
            </ListItemIcon>
            <ListItemText>Overwrite</ListItemText>
          </CloseOnClickMenuItem>

          <CloseOnClickMenuItem
            onClick={() => deleteView(view.id)}
            closeMenu={() => setActionsMenuAnchorEl(null)}
          >
            <ListItemIcon>
              <Delete fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </CloseOnClickMenuItem>
        </Menu>
      )}
    </>
  );
};

export const QuickViewSection = () => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const quickViews = useQuickViews();
  const [canUndo, canRedo] = useCanUndoRedo();
  const selectedViewId = useSelectedViewId();

  const [editingView, setEditingView] = useState<QuickView | null>(null);

  return (
    <>
      {/* slightly jank to have this section assume there's a parent MUI list, but I think it's worth extracting to this component anyway */}

      <ListItem
        key="QuickViewSection"
        disablePadding={false}
        sx={{ paddingY: 0, height: "40px" }} // icon buttons have padding, so this extra padding isn't necessary, and use a consistent height whether or not icon buttons are showing
      >
        <ListItemText primary="Quick Views" className="*:font-bold" />

        {userCanEditTopicData && (
          <>
            <IconButton
              color="inherit"
              title="Undo"
              aria-label="Undo"
              disabled={!canUndo}
              onClick={() => undo()}
            >
              <Undo />
            </IconButton>
            <IconButton
              color="inherit"
              title="Redo"
              aria-label="Redo"
              disabled={!canRedo}
              onClick={() => redo()}
            >
              <Redo />
            </IconButton>

            <Divider orientation="vertical" flexItem sx={{ marginX: 0.5 }} />

            <IconButton
              color="inherit"
              title="Create View"
              aria-label="Create View"
              onClick={() => createView()}
            >
              <Add />
            </IconButton>
          </>
        )}
      </ListItem>

      <List disablePadding>
        {quickViews.length === 0 && (
          <ListItem key="1">
            <ListItemButton disabled={true}>
              <ListItemIcon>
                <Visibility />
              </ListItemIcon>
              <ListItemText primary="No quick views yet!" />
            </ListItemButton>
          </ListItem>
        )}
        {quickViews.map((view) => (
          <QuickViewRow
            key={view.id}
            view={view}
            selected={selectedViewId === view.id}
            editable={userCanEditTopicData}
            onEdit={() => setEditingView(view)}
          />
        ))}
      </List>

      {editingView !== null && (
        <QuickViewForm
          currentView={editingView}
          quickViews={quickViews}
          onClose={() => setEditingView(null)}
        />
      )}
    </>
  );
};
