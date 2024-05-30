import { Abc, AutoStories, Close, Info } from "@mui/icons-material";
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

import { discordInvite, facebookPage, githubRepo } from "@/web/common/urls";

import favicon from "../../../../../public/favicon.png";

interface Props {
  isSiteDrawerOpen: boolean;
  setIsSiteDrawerOpen: (isOpen: boolean) => void;
}

export const SiteDrawer = ({ isSiteDrawerOpen, setIsSiteDrawerOpen }: Props) => {
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
            <Image src={favicon} height={32} width={32} alt="home" />
          </ListItemIcon>
          <ListItemText primary="Ameliorate" />
        </ListItem>

        <Divider />

        <ListItem>
          <ListItemButton LinkComponent={NextLink} href="/playground">
            <ListItemIcon>
              <AutoStories />
            </ListItemIcon>
            <ListItemText primary="Playground" />
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemButton LinkComponent={NextLink} href="/examples">
            <ListItemIcon>
              <Abc />
            </ListItemIcon>
            <ListItemText primary="Examples" />
          </ListItemButton>
        </ListItem>

        <Divider />

        <ListItem>
          <ListItemButton LinkComponent={NextLink} href="https://ameliorate.app/docs">
            <ListItemIcon>
              <Info />
            </ListItemIcon>
            <ListItemText primary="Documentation" />
          </ListItemButton>
        </ListItem>

        <Divider />

        <ListItem>
          <Stack direction="row" alignItems="center" spacing={2} padding={2}>
            <Link href={facebookPage} target="_blank" display="flex">
              <Image
                src={`/${theme.palette.mode}/Facebook-Icon.png`}
                height={32}
                width={32}
                alt="facebook link"
              />
            </Link>
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
