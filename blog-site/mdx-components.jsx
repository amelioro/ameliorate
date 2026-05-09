/**
 * Copied from https://the-guild.dev/blog/nextra-4#migration-guide
 */

import { useMDXComponents as getDocsMDXComponents } from "nextra-theme-docs";

import { ImageWithCaption } from "./app/components/ImageWithCaption";

const docsComponents = getDocsMDXComponents();

export function useMDXComponents(components) {
  return {
    ...docsComponents,
    img: ImageWithCaption,
    ...components,
  };
}
