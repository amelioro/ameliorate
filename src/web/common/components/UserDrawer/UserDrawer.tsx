import { Close, Logout, Notifications } from "@mui/icons-material";
import {
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import NextLink from "next/link";

import { ProfileIcon } from "@/web/common/components/ProfileIcon/ProfileIcon";

interface Props {
  username: string;
  isUserDrawerOpen: boolean;
  setIsUserDrawerOpen: (isOpen: boolean) => void;
}

export const UserDrawer = ({ username, isUserDrawerOpen, setIsUserDrawerOpen }: Props) => {
  return (
    <Drawer anchor="right" open={isUserDrawerOpen} onClose={() => setIsUserDrawerOpen(false)}>
      <List>
        <ListItem
          disablePadding={false}
          secondaryAction={
            <IconButton edge="end" aria-label="close" onClick={() => setIsUserDrawerOpen(false)}>
              <Close />
            </IconButton>
          }
        >
          <ListItemIcon>
            <ProfileIcon username={username} />
          </ListItemIcon>
          <ListItemText primary={username} />
        </ListItem>

        <Divider />

        <ListItem>
          <ListItemButton LinkComponent={NextLink} href={"/notifications"}>
            <ListItemIcon>
              <Notifications />
            </ListItemIcon>
            <ListItemText primary="My Notifications" />
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemButton
            LinkComponent={NextLink}
            // might ideally `returnTo` same as `Login` button does, but doesn't seem to work for logout endpoint
            href="/api/auth/logout"
          >
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Log out" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};
