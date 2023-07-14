// Combine look of Material Link with functionality of Nextjs Link.

// Tried setting NextLink as the default component of MuiLink via MUI themeing (https://stackoverflow.com/a/74419666),
// but it would hit an infinite recursion issue without making a custom component anyways.

// TODO #167: for some reason, upgrading to Next 13 caused MuiLink to throw a server-client class
// mismatch error if any decoration props are set.

import MuiLink, { type LinkProps as MuiLinkProps } from "@mui/material/Link";
import NextLink from "next/link";
import { forwardRef } from "react";

export const Link = forwardRef<HTMLAnchorElement, MuiLinkProps>(function Link(props, ref) {
  return <MuiLink component={NextLink} ref={ref} {...props} />;
});
