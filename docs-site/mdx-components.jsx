/**
 * Copied from https://the-guild.dev/blog/nextra-4#migration-guide
 *
 * Not actually sure why this is needed
 */

import { useMDXComponents as getDocsMDXComponents } from "nextra-theme-docs";

const docsComponents = getDocsMDXComponents();

export function useMDXComponents(components) {
  return {
    ...docsComponents,
    ...components,
    // ... your additional components
  };
}
