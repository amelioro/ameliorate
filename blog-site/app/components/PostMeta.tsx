"use client";

import { useConfig } from "nextra-theme-docs";

export function PostMeta() {
  const { normalizePagesResult } = useConfig();
  const frontmatter = normalizePagesResult.activeMetadata;

  if (!frontmatter?.date) return null;

  const title = frontmatter.title;
  const formattedDate = new Date(frontmatter.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const author = frontmatter.author ?? "Joel Keyser";
  const tags: string[] = frontmatter.tags ?? [];

  return (
    <>
      {title && <h1>{title}</h1>}
      <div className="x:mb-8 x:flex x:flex-wrap x:items-center x:gap-2 x:text-sm x:text-gray-500 x:dark:text-gray-400">
        <span>{formattedDate}</span>
        {author && <span>by {author}</span>}
        {tags.length > 0 && (
          <div className="x:flex x:gap-1.5">
            {tags.map((tag) => (
              <span key={tag} className="tag-pill">
                <a href={`/blog/tags/${tag}`}>{tag}</a>
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
