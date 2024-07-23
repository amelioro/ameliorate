import { AutoStories, Close, Fort } from "@mui/icons-material";
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
  Stack,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import NextLink from "next/link";

import { discordInvite, githubRepo } from "@/web/common/urls";
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
          disablePadding={false}
          secondaryAction={
            <IconButton edge="end" aria-label="close" onClick={() => setIsSiteDrawerOpen(false)}>
              <Close />
            </IconButton>
          }
        >
          <ListItemIcon>
            {/* use styling to set width and height instead of Image props because otherwise this throws a warning about only having height or width set */}
            {/* no idea why specifically this favicon throws this warning, and other Image-links in Header don't. */}
            <Image src={favicon} alt="home" className="size-8" />
          </ListItemIcon>
          <ListItemText primary="Ameliorate" />
        </ListItem>

        <Divider />

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

        <Divider />

        <ListItem>
          <Stack direction="row" alignItems="center" spacing={2} padding={2}>
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
          </Stack>
        </ListItem>
      </List>
    </Drawer>
  );
};
