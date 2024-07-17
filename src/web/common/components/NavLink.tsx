import { type LinkProps } from "@mui/material";
import { forwardRef } from "react";

import { Link } from "@/web/common/components/Link";

export const NavLink = forwardRef<HTMLAnchorElement, LinkProps>(function NavLink(props, ref) {
  // navigability of links is implied by being in the navbar, so decoration isn't necessary
  return <Link ref={ref} {...props} underline="hover" className="text-text-primary" />;
});
