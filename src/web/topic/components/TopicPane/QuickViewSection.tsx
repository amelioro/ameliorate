import { Add, Delete, Edit, Redo, Save, SwapVert, Undo, Visibility } from "@mui/icons-material";
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
import { useUserCanEditTopicData } from "@/web/topic/store/userHooks";
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
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <ListItem key={view.id}>
      <ListItemButton
        selected={selected}
        onClick={() => selectView(view.id)}
        sx={{ paddingY: 0, height: "40px" }} // icon buttons have padding, so this extra padding isn't necessary, and use a consistent height whether or not icon buttons are showing
      >
        <ListItemIcon>
          {editable ? (
            <>
              <IconButton
                color="inherit"
                title="Reorder View"
                aria-label="Reorder View"
                onClick={(e) => {
                  setMenuAnchorEl(e.currentTarget);
                  e.stopPropagation(); // don't also trigger row select
                }}
              >
                <SwapVert />
              </IconButton>
              <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={() => setMenuAnchorEl(null)}
              >
                <CloseOnClickMenuItem
                  onClick={(e) => {
                    moveView(view.id, "up");
                    e.stopPropagation(); // don't also trigger row select
                  }}
                  closeMenu={() => setMenuAnchorEl(null)}
                >
                  Move up
                </CloseOnClickMenuItem>
                <CloseOnClickMenuItem
                  onClick={(e) => {
                    moveView(view.id, "down");
                    e.stopPropagation(); // don't also trigger row select
                  }}
                  closeMenu={() => setMenuAnchorEl(null)}
                >
                  Move down
                </CloseOnClickMenuItem>
              </Menu>
            </>
          ) : (
            <Visibility />
          )}
        </ListItemIcon>

        <ListItemText primary={view.title} />

        {editable && (
          <>
            <IconButton
              color="inherit"
              title="Edit View"
              aria-label="Edit View"
              onClick={(e) => {
                onEdit();
                e.stopPropagation(); // don't also trigger row select
              }}
            >
              <Edit />
            </IconButton>
            <IconButton
              color="inherit"
              title="Overwrite View"
              aria-label="Overwrite View"
              // Assumes that the selected view is being displayed, so saving wouldn't do anything.
              // Could be more accurate by checking if this index's view state deep equals the current view state... but that seems overkill performance-wise.
              disabled={selected}
              onClick={(e) => {
                saveView(view.id);
                e.stopPropagation(); // don't also trigger row select
              }}
            >
              <Save />
            </IconButton>
            <IconButton
              color="inherit"
              title="Delete View"
              aria-label="Delete View"
              onClick={(e) => {
                deleteView(view.id);
                e.stopPropagation(); // don't also trigger row select
              }}
            >
              <Delete />
            </IconButton>
          </>
        )}
      </ListItemButton>
    </ListItem>
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
        <ListItemText primary="Quick Views" />

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
