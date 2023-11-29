import { AutoStoriesOutlined, Build, Close, Route } from "@mui/icons-material";
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

import { Perspectives } from "../../../view/components/Perspectives/Perspectives";
import { useIsTableActive, useShowImpliedEdges } from "../../store/store";
import { useOnPlayground } from "../../store/topicHooks";
import { resetTopicData } from "../../store/utilActions";
import { toggleShowImpliedEdges } from "../../store/viewActions";

interface Props {
  isMoreActionsDrawerOpen: boolean;
  setIsMoreActionsDrawerOpen: (isOpen: boolean) => void;
}

export const MoreActionsDrawer = ({
  isMoreActionsDrawerOpen,
  setIsMoreActionsDrawerOpen,
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
          <IconButton color="inherit" title="Reset" aria-label="Reset" onClick={resetTopicData}>
            <AutoStoriesOutlined />
          </IconButton>

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
