import { Add, Delete, Edit, Redo, Save, Undo, Visibility } from "@mui/icons-material";
import {
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useState } from "react";

import { useSessionUser } from "../../../common/hooks";
import {
  QuickView,
  createView,
  deleteView,
  redo,
  saveView,
  selectView,
  undo,
  useCanUndoRedo,
  useQuickViews,
  useSelectedViewId,
} from "../../../view/quickViewStore/store";
import { useUserCanEditTopicData } from "../../store/userHooks";
import { QuickViewForm } from "./QuickViewForm";

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
          <ListItem key={view.id}>
            <ListItemButton
              selected={selectedViewId === view.id}
              onClick={() => selectView(view.id)}
              sx={{ paddingY: 0, height: "40px" }} // icon buttons have padding, so this extra padding isn't necessary, and use a consistent height whether or not icon buttons are showing
            >
              <ListItemIcon>
                <Visibility />
              </ListItemIcon>

              <ListItemText primary={view.title} />

              {userCanEditTopicData && (
                <>
                  <IconButton
                    color="inherit"
                    title="Edit View"
                    aria-label="Edit View"
                    onClick={(e) => {
                      setEditingView(view);
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
                    disabled={selectedViewId === view.id}
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
