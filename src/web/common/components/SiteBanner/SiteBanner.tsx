import { Alert } from "@mui/material";
import { useEffect } from "react";

import { Link } from "@/web/common/components/Link";
import {
  hideBanner,
  initializeBanner,
  useShowBanner,
} from "@/web/common/components/SiteBanner/bannerStore";
import { reasoningToolsDiscordInvite } from "@/web/common/urls";

export const SiteBanner = () => {
  const showBanner = useShowBanner();

  useEffect(() => {
    void initializeBanner();
  }, []);

  if (!showBanner) return null;

  return (
    <Alert
      severity="success"
      // ml-unset so that text is centered... not sure how to easily center the text while keeping close button on the right, without changing MUI html structure
      className="justify-center text-center [&_>_.MuiAlert-action]:ml-[unset]"
      icon={false}
      onClose={() => hideBanner()}
    >
      <span>🧠 Want to discuss tools like Ameliorate? Join the Collaborative Reasoning Tech </span>
      <Link href={reasoningToolsDiscordInvite} target="_blank">
        Discord Server
      </Link>
      !
    </Alert>
  );
};
