import { AccountCircle, AutoStories, Close, Logout } from "@mui/icons-material";
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

interface Props {
  user: { username: string };
  isUserDrawerOpen: boolean;
  setIsUserDrawerOpen: (isOpen: boolean) => void;
}

export const UserDrawer = ({ user, isUserDrawerOpen, setIsUserDrawerOpen }: Props) => {
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
            <AccountCircle />
          </ListItemIcon>
          <ListItemText primary={user.username} />
        </ListItem>

        <Divider />

        <ListItem>
          <ListItemButton LinkComponent={NextLink} href={`/${user.username}`}>
            <ListItemIcon>
              <AutoStories />
            </ListItemIcon>
            <ListItemText primary="My Topics" />
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemButton LinkComponent={NextLink} href="/api/auth/logout">
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
