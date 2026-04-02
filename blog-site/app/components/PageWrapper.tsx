import { SkipNavContent } from "nextra/components";
import { useMDXComponents } from "nextra-theme-docs";
import { ReactNode } from "react";

// Get the MDX wrapper component which renders the Sidebar + article structure.
// Custom page.tsx files bypass the MDX pipeline, so they miss the sidebar/body
// wrapper that .mdx pages get. Calling the wrapper manually replicates that structure.
const { wrapper: MdxWrapper } = useMDXComponents({});

export function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <MdxWrapper toc={[]} metadata={{ searchable: false }}>
      <SkipNavContent />
      {children}
    </MdxWrapper>
  );
}
