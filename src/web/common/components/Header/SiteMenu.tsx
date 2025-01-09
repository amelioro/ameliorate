import { Menu } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { SiteDrawer } from "@/web/common/components/SiteDrawer/SiteDrawer";
import { useSessionUser } from "@/web/common/hooks";

interface Props {
  className?: string;
}

export const SiteMenu = ({ className }: Props) => {
  const { sessionUser } = useSessionUser();
  const { asPath } = useRouter();

  const [isSiteDrawerOpen, setIsSiteDrawerOpen] = useState(false);

  useEffect(() => {
    // close drawers after navigating
    setIsSiteDrawerOpen(false);
  }, [asPath]);

  return (
    <>
      <IconButton onClick={() => setIsSiteDrawerOpen(true)} className={className}>
        <Menu />
      </IconButton>
      <SiteDrawer
        username={sessionUser?.username}
        isSiteDrawerOpen={isSiteDrawerOpen}
        setIsSiteDrawerOpen={setIsSiteDrawerOpen}
      />
    </>
  );
};
