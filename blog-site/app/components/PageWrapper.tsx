import { useMDXComponents } from "nextra-theme-docs";
import { ReactNode } from "react";

/**
 * Renders the same Sidebar + article + TOC structure that nextra wraps around `.mdx` files,
 * but for custom `page.tsx` files (e.g. the "All Posts" page) which bypass nextra's MDX
 * pipeline and would otherwise render naked content without the surrounding shell.
 */
export function PageWrapper({ children }: { children: ReactNode }) {
  const mdxComponents = useMDXComponents({});

  return (
    <mdxComponents.wrapper toc={[]} metadata={{ title: "", filePath: "" }}>
      {children}
    </mdxComponents.wrapper>
  );
}
