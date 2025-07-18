import { Add, AutoStories, Campaign, Close, Fort, MenuBook } from "@mui/icons-material";
import {
  Divider,
  Drawer,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import NextLink from "next/link";

import { discordInvite, feedbackPage, githubRepo } from "@/web/common/urls";
import favicon from "~/public/favicon.png";

interface Props {
  username?: string;
  isSiteDrawerOpen: boolean;
  setIsSiteDrawerOpen: (isOpen: boolean) => void;
}

export const SiteDrawer = ({ username, isSiteDrawerOpen, setIsSiteDrawerOpen }: Props) => {
  const theme = useTheme();

  return (
    <Drawer anchor="left" open={isSiteDrawerOpen} onClose={() => setIsSiteDrawerOpen(false)}>
      <List>
        <ListItem
          secondaryAction={
            <IconButton edge="end" aria-label="close" onClick={() => setIsSiteDrawerOpen(false)}>
              <Close />
            </IconButton>
          }
        >
          <ListItemButton LinkComponent={NextLink} href="/">
            <ListItemIcon>
              {/* use styling to set width and height instead of Image props because otherwise this throws a warning about only having height or width set */}
              {/* no idea why specifically this favicon throws this warning, and other Image-links in Header don't. */}
              <Image src={favicon} alt="home" className="size-8" />
            </ListItemIcon>
            <ListItemText primary="Ameliorate" />
          </ListItemButton>
        </ListItem>

        <Divider className="my-1" />

        <ListItem>
          <ListItemButton LinkComponent={NextLink} href="/playground">
            <ListItemIcon>
              <Fort />
            </ListItemIcon>
            <ListItemText primary="Playground" />
          </ListItemButton>
        </ListItem>
        {username && (
          <ListItem>
            <ListItemButton LinkComponent={NextLink} href={`/${username}`}>
              <ListItemIcon>
                <AutoStories />
              </ListItemIcon>
              <ListItemText primary="My Topics" />
            </ListItemButton>
          </ListItem>
        )}
        {/* this can be shown without being logged in because it'll redirect to the login page if need be */}
        <ListItem>
          <ListItemButton LinkComponent={NextLink} href="/new">
            <ListItemIcon>
              <Add />
            </ListItemIcon>
            <ListItemText primary="New Topic" />
          </ListItemButton>
        </ListItem>

        <Divider className="my-1" />

        <ListItem>
          <ListItemButton
            LinkComponent={NextLink}
            href="https://ameliorate.app/docs"
            target="_blank"
          >
            <ListItemIcon>
              <MenuBook />
            </ListItemIcon>
            <ListItemText primary="Docs" />
          </ListItemButton>
        </ListItem>

        <ListItem>
          <ListItemButton LinkComponent={NextLink} href={feedbackPage} target="_blank">
            <ListItemIcon>
              <Campaign />
            </ListItemIcon>
            <ListItemText primary="Feedback" />
          </ListItemButton>
        </ListItem>

        <ListItem>
          <div className="flex items-center gap-2 px-4 py-2">
            <Link href={discordInvite} target="_blank" display="flex">
              <Image
                src={`/${theme.palette.mode}/Discord-Mark.png`}
                height={24}
                width={32}
                alt="discord link"
              />
            </Link>
            <Link href={githubRepo} target="_blank" display="flex">
              <Image
                src={`/${theme.palette.mode}/GitHub-Mark.png`}
                height={32}
                width={32}
                alt="github link"
              />
            </Link>
          </div>
        </ListItem>
      </List>
    </Drawer>
  );
};
