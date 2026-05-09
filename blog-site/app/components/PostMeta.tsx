"use client";

import { useConfig } from "nextra-theme-docs";

interface PostFrontMatter {
  title?: string;
  date?: string;
  author?: string;
}

export function PostMeta() {
  const { normalizePagesResult } = useConfig();
  const frontmatter = normalizePagesResult.activeMetadata as PostFrontMatter | undefined;

  if (!frontmatter?.date || !frontmatter.title || !frontmatter.author)
    throw new Error("Missing required post metadata");

  const formattedDate = new Date(frontmatter.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <h1>{frontmatter.title}</h1>
      <div className="x:mb-8 x:flex x:flex-wrap x:items-center x:gap-2 x:text-sm x:text-gray-500 x:dark:text-gray-400">
        <span>{formattedDate}</span>
        <span>by {frontmatter.author}</span>
      </div>
    </>
  );
}
