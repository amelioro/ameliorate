import { Alert } from "@mui/material";
import { useEffect } from "react";

import { Link } from "@/web/common/components/Link";
import {
  hideBanner,
  initializeBanner,
  useShowBanner,
} from "@/web/common/components/SiteBanner/bannerStore";

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
      <span className="hidden sm:[display:unset]">
        🚀 Looking for an easy way to help out? Pilot test Ameliorate!{" "}
      </span>
      {/* Shorter message so it can stay on one line for small screens, so we can have consistent height calcs for showing the second home page section on initial load */}
      <span className="sm:hidden">🚀 Help pilot test Ameliorate! </span>
      <Link href="https://ameliorate.app/docs/pilot-testing" target="_blank">
        Read more
      </Link>
    </Alert>
  );
};
