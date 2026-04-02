# Blog Design v2: More-Consistent Blog Using Docs Theme

## Motivation

The current blog uses `nextra-theme-blog`, which has a fundamentally different layout, header, styling, and navigation from the docs site (`nextra-theme-docs`). This creates a jarring experience when navigating between blog and docs. Since the docs theme already provides sidebar navigation, a "Table of Contents" (TOC) pane, prev/next pagination, and consistent heading/link styles, we can reuse it for the blog with modest customization — gaining consistency and arguably a better reading experience.

## What We Gain by Switching to `nextra-theme-docs`

| Feature                        | Blog Theme (current)                                     | Docs Theme (proposed)                                                                 |
| ------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Header / Navbar                | Custom blog header (logo + GitHub/Discord + ThemeSwitch) | Same Navbar as docs-site (logo, GitHub, Discord, theme switch, + "Blog"/"Docs" links) |
| Heading/link styling           | Blog theme's own typography                              | Same as docs (consistent across sites)                                                |
| Table of contents (right pane) | None — manual `## Table of Contents` Markdown links      | Built-in "On This Page" TOC pane on desktop, auto-generated from headings             |
| Sidebar (left pane)            | None                                                     | "All Posts" at top, then posts sorted newest-first                                    |
| Prev/next navigation           | None                                                     | Built-in bottom links to adjacent posts                                               |
| Feedback link                  | None                                                     | "Question? Give us feedback" (same as docs)                                           |
| Search                         | None                                                     | Not needed (omit)                                                                     |
| Breadcrumbs                    | N/A                                                      | Docs theme shows these by default — need to disable for blog                          |
| "Edit this page"               | N/A                                                      | Docs theme shows this by default — need to disable for blog                           |

## Approach: Stay as a Separate Project

The blog will remain a separate `blog-site/` project (same decision as v1). The only change is swapping the theme package from `nextra-theme-blog` → `nextra-theme-docs`.

Since the `PostCard` component comes from `nextra-theme-blog`, and the RSS route + `get-posts.ts` use only core `nextra` APIs (`nextra/page-map`, `nextra/normalize-pages`), the migration is straightforward:

- RSS route: no changes needed (theme-agnostic).
- `get-posts.ts`: no changes needed (theme-agnostic).
- `PostCard`: need a replacement since it comes from `nextra-theme-blog` and we don't want to install that package alongside `nextra-theme-docs`. Build a simple custom `PostCard` component (see details below).

## Detailed Plan

### 1. Dependencies

**Remove:** `nextra-theme-blog`
**Add:** `nextra-theme-docs`

```json
{
  "dependencies": {
    "next": "^15.5.10",
    "nextra": "^4.2.16",
    "nextra-theme-docs": "^4.2.16",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next-plausible": "^3.12.4",
    "next-sitemap": "^4.2.3",
    "react-lite-youtube-embed": "^3.5.1"
  }
}
```

### 2. Layout (`app/layout.tsx`)

Rewrite to match docs-site's pattern closely:

```tsx
import { Metadata } from "next";
import Image from "next/image";
import PlausibleProvider from "next-plausible";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import "nextra-theme-docs/style-prefixed.css";
import { ReactNode } from "react";

import { discordInvite, githubRepo } from "../../src/web/common/urls";

const faviconIco = "https://ameliorate.app/favicon.ico";
const faviconPng = "https://ameliorate.app/favicon.png";

export const metadata: Metadata = {
  title: {
    default: "Blog | Ameliorate",
    template: "%s | Ameliorate Blog",
  },
};

const navbar = (
  <Navbar
    logo={
      <div className="x:flex x:items-center x:gap-2">
        <Image src={faviconPng} alt="home" height={32} width={32} />
        <span className="x:text-xl x:font-medium">Ameliorate</span>
      </div>
    }
    logoLink="https://ameliorate.app"
    projectLink={githubRepo}
    chatLink={discordInvite}
  />
);

const footer = (
  <Footer>
    <a href="/blog/rss.xml">RSS</a>
  </Footer>
);

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head>
        <link rel="icon" href={faviconIco} />
      </Head>
      <body>
        <PlausibleProvider domain="ameliorate.app">
          <Layout
            navbar={navbar}
            pageMap={await getPageMap()}
            // No search widget for blog
            search={null}
            // No "Edit this page" for blog
            editLink={null}
            // "Question? Give us feedback" — same form as docs
            feedback={{
              content: "Question? Give us feedback",
              labels: "feedback",
            }}
            sidebar={{ defaultMenuCollapseLevel: Infinity }}
            footer={footer}
            toc={{ backToTop: <>Scroll to top</> }}
          >
            {children}
          </Layout>
        </PlausibleProvider>
      </body>
    </html>
  );
}
```

**Key differences from docs-site layout:**

- No `<Banner>` (no alpha status warning needed for blog)
- `search={null}` — no search widget
- `editLink={null}` — no "Edit this page on GitHub"
- `sidebar.defaultMenuCollapseLevel: Infinity` — show all posts expanded (flat list, no collapsing needed)
- Footer contains only RSS link
- Same logo, GitHub, Discord as docs-site

### 3. Navbar: "Blog" and "Docs" Links via `_meta.ts`

The Nextra docs theme supports `type: 'page'` items in `_meta.ts` that appear as navbar items. We can use this to add "Blog" and "Docs" links.

**`app/_meta.ts`:**

```ts
const meta = {
  // Disable breadcrumbs, timestamps, and use article typesetting for all blog pages
  "*": {
    theme: {
      breadcrumb: false,
      timestamp: false,
      typesetting: "article",
    },
  },
  index: {
    title: "All Posts",
    type: "page",
    // this tells the theme this is the page to show; the sidebar will list its children (posts)
  },
  posts: {
    title: "Posts",
    // Hide the "posts" folder from the navbar, only show in sidebar
    display: "children",
  },
  // Hidden from sidebar/navbar — only navigated to via tag links on the All Posts and tag listing pages
  tags: {
    display: "hidden",
  },
  // Hidden — this is a non-page API route for RSS
  "rss.xml": {
    display: "hidden",
  },
  // Navbar-only links to Docs and Blog (current site)
  docs: {
    title: "Docs",
    type: "page",
    href: "https://ameliorate.app/docs",
  },
  blog: {
    title: "Blog",
    type: "page",
    href: "https://ameliorate.app/blog",
  },
};

export default meta;
```

The docs-site's `_meta.ts` would also be updated to add equivalent cross-links:

```ts
// Add to docs-site/app/_meta.ts
blog: {
  title: "Blog",
  type: "page",
  href: "https://ameliorate.app/blog",
},
docs: {
  title: "Docs",
  type: "page",
  href: "https://ameliorate.app/docs",
},
```

**Important consideration:** The `type: 'page'` items with `href` appear as text links in the Nextra navbar, right where you'd expect. This aligns with the answer to use simple text links next to the GitHub/Discord icons.

### 4. Sidebar: Posts Listed by Recency

The sidebar in `nextra-theme-docs` is driven by `_meta.ts` files, which define the order of items. We need a `posts/_meta.ts` that lists all posts from newest to oldest.

**`app/posts/_meta.ts`:**

```ts
const meta = {
  // Newest first
  "2026-01-06-update-summarizing-nonprofitizing":
    "1/6/26: Summarizing, Nonprofit-izing, Communitizing",
  "2025-05-15-update-socializing": "5/15/25: Socializing",
  "2024-12-12-update-reducing-clutter": "12/12/24: Reducing Clutter",
  "2024-09-03-update-feature-bonanza": "9/3/24: Feature Bonanza",
  "2024-03-18-update-a-better-view": "3/18/24: A Better View",
  "2024-01-08-update-a-place-for-everything": "1/8/24: A Place for Everything",
  "2023-09-25-update-sharing-and-comparing": "9/25/23: Sharing and Comparing",
  "2023-05-12-update-dream-to-ameliorate": "5/12/23: A Dream to Ameliorate",
};

export default meta;
```

**Trade-off:** With the blog theme, new posts automatically appear (get-posts sorts by date). With the docs theme, every new post must also be added to `_meta.ts` to control sidebar order and title. This is a minor maintenance cost but gives precise control. An alternative is to not use a `_meta.ts` and let Nextra auto-sort alphabetically — but since the directory names are date-prefixed (e.g. `2026-01-06-...`), alphabetical sort would actually be chronological (oldest first). We want newest first, so either:

- Manually maintain `_meta.ts` (recommended — gives nice short titles too), OR
- Accept oldest-first in sidebar, OR
- Reverse the date prefix convention (not recommended — confusing)

### 5. Disabling Breadcrumbs, Timestamps, etc. Site-Wide

The docs theme shows breadcrumbs and "last updated" timestamps by default. Neither is useful for any blog page. These are disabled globally via the `'*'` fallback in the root `app/_meta.ts` (see section 3), which applies to all pages site-wide (including the All Posts landing page, tag pages, and individual posts).

### 6. Author / Date / Tags at the Top of Each Post

The docs theme doesn't have built-in blog metadata rendering (author, date, tags), but we can automatically read frontmatter at runtime using the `useConfig` hook from `nextra-theme-docs`.

**Approach: `PostMeta` component that reads frontmatter via `useConfig`**

The `useConfig()` hook returns `normalizePagesResult.activeMetadata`, which contains the current page's parsed frontmatter. This means a `PostMeta` component can read `date`, `tags`, etc. without any props — no duplication with frontmatter.

Create `app/components/PostMeta.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useConfig } from "nextra-theme-docs";

export function PostMeta() {
  const { normalizePagesResult } = useConfig();
  const frontmatter = normalizePagesResult.activeMetadata;

  if (!frontmatter?.date) return null;

  const formattedDate = new Date(frontmatter.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const author = frontmatter.author ?? "Joel Keyser";
  const tags: string[] = frontmatter.tags ?? [];

  return (
    <div className="x:mb-8 x:text-sm x:text-gray-500 dark:x:text-gray-400">
      <span>{formattedDate}</span>
      {author && <span> · {author}</span>}
      {tags.length > 0 && (
        <span>
          {" · "}
          {tags.map((tag, i) => (
            <span key={tag}>
              <Link href={`/tags/${tag}`} className="x:text-primary-600 x:underline">
                {tag}
              </Link>
              {i < tags.length - 1 && ", "}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}
```

Usage in each post's MDX (no props needed — reads frontmatter automatically):

```mdx
---
title: "Ameliorate Update 1/6/26: ..."
date: 2026-01-06T12:00
description: "..."
tags:
  - update
---

import { PostMeta } from "../../components/PostMeta";

<PostMeta />

... post content ...
```

**Why this works:** `useConfig` is a client-side hook available to any component within the Nextra `<Layout>` tree. It accesses the currently active page's frontmatter via `normalizePagesResult.activeMetadata`. The component requires `"use client"` since it uses a React hook.

**Note:** Each post still needs the `import` + `<PostMeta />` line. We could potentially automate this away by overriding the MDX wrapper in `mdx-components.jsx` to detect posts (by checking for a `date` field in frontmatter), but that adds complexity and fragility. A single import line per post is minimal overhead and very explicit.

### 7. "All Posts" Landing Page

The root page (`app/page.tsx` or `app/page.mdx`) becomes the "All Posts" page. This replaces the current blog landing page.

**`app/page.tsx`:**

```tsx
import Link from "next/link";
import { getPosts, getTags } from "./posts/get-posts";
import { PostCard } from "./components/PostCard";

export const metadata = {
  title: "Blog | Ameliorate",
};

export default async function AllPostsPage() {
  const tags = await getTags();
  const posts = await getPosts();
  const allTags = Object.fromEntries(
    Array.from(new Set(tags)).map((tag) => [tag, tags.filter((t) => t === tag).length]),
  );

  return (
    <div data-pagefind-ignore="all">
      <h1>All Posts</h1>
      <p>
        Want to get notified of new posts?{" "}
        <a href="https://amelioro.substack.com/" target="_blank" rel="noreferrer">
          Subscribe via Substack
        </a>
        .
      </p>
      <div
        className="not-prose"
        style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", alignItems: "center" }}
      >
        <span style={{ fontWeight: 500 }}>Tags:</span>
        {Object.entries(allTags).map(([tag, count]) => (
          <Link key={tag} href={`/tags/${tag}`} className="nextra-tag">
            {tag} ({count})
          </Link>
        ))}
      </div>
      {posts.map((post) => (
        <PostCard key={post.route} post={post} />
      ))}
    </div>
  );
}
```

### 8. Custom `PostCard` Component

Since we can no longer import `PostCard` from `nextra-theme-blog`, build a simple replacement:

**`app/components/PostCard.tsx`:**

```tsx
import Link from "next/link";
import type { Post } from "../posts/get-posts";

export function PostCard({ post }: { post: Post }) {
  const formattedDate = new Date(post.frontMatter.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="x:mb-6 x:mt-6">
      <h3 className="x:m-0">
        <Link href={post.route} className="x:no-underline x:hover:underline">
          {post.title}
        </Link>
      </h3>
      <p className="x:text-sm x:text-gray-500 x:mt-1 x:mb-1">
        {formattedDate}
        {post.frontMatter.tags?.length > 0 && ` · ${post.frontMatter.tags.join(", ")}`}
      </p>
      {post.frontMatter.description && (
        <p className="x:text-gray-600 dark:x:text-gray-400 x:mt-1">
          {post.frontMatter.description}
        </p>
      )}
    </div>
  );
}
```

This is simpler than the `nextra-theme-blog` PostCard but covers the essentials: title as link, date, tags, description. It also inherits the docs theme's styling.

### 9. `/tags/[tag]` Page

Same approach as current, but use the custom `PostCard` instead of the blog theme's:

```tsx
import { PostCard } from "../../components/PostCard";
import { getPosts, getTags } from "../../posts/get-posts";

// ... same generateMetadata and generateStaticParams as current ...

export default async function TagPage(props: { params: Promise<{ tag: string }> }) {
  const params = await props.params;
  const title = `Posts Tagged with "${decodeURIComponent(params.tag)}"`;
  const posts = await getPosts();
  return (
    <>
      <h1>{title}</h1>
      {posts
        .filter((post) => post.frontMatter.tags.includes(decodeURIComponent(params.tag)))
        .map((post) => (
          <PostCard key={post.route} post={post} />
        ))}
    </>
  );
}
```

**Note:** The `/tags/[tag]` route is configured as `display: 'hidden'` in the root `_meta.ts` (see section 3) so it doesn't appear in sidebar/navbar. It's only navigated to via tag links on the All Posts and tag listing pages.

### 10. RSS Route

**No changes needed.** The RSS route (`app/rss.xml/route.ts`) uses `get-posts.ts` which relies on `nextra/page-map` and `nextra/normalize-pages` — both from core Nextra, not the blog theme. It's set as `display: 'hidden'` in the root `_meta.ts` (see section 3) to keep it out of navigation.

### 11. `mdx-components.jsx`

Switch from blog to docs theme components:

```jsx
import { useMDXComponents as getDocsMDXComponents } from "nextra-theme-docs";

const docsComponents = getDocsMDXComponents();

export function useMDXComponents(components) {
  return {
    ...docsComponents,
    ...components,
  };
}
```

### 12. `custom.css`

The current blog theme CSS overrides (widening prose width, image caption styling) may need to be adjusted or simplified since the docs theme has different default widths. Evaluate after initial migration and adjust as needed:

- The docs theme's content area is ~48rem by default with the sidebar present, which may already be fine.
- Image caption styling can likely remain or be simplified.
- The `typesetting: 'article'` setting (see section 14) may render some or all of the custom CSS unnecessary — evaluate after enabling it.

### 13. Manual TOC Removal

Currently, several blog posts have a manual `## Table of Contents` section with Markdown links to headings. With the docs theme's built-in TOC pane on the right side, these manual TOCs become redundant.

**Action:** Remove the manual `## Table of Contents` section from each post where it exists. The docs theme's TOC will automatically pick up all `##` and `###` headings.

### 14. `typesetting: 'article'` for Blog Posts

Nextra docs theme supports a `typesetting: 'article'` mode that uses more elegant typography (nicer fonts, spacing) suitable for long-form content like blog posts, compared to the default docs typesetting. This is already enabled in the root `_meta.ts` `'*'` fallback (see section 3/5).

Worth testing — may provide better reading experience for blog content. May also make some `custom.css` overrides unnecessary.

### 15. Update Main App Header: Replace "Feedback" with "Blog"

The main app's home page header (in `src/web/common/components/Header/SiteHeader.tsx`) currently has a "Feedback" link. Replace it with a "Blog" link pointing to `/blog`.

Also update the mobile drawer (`src/web/common/components/SiteDrawer/SiteDrawer.tsx`) similarly — replace the "Feedback" drawer item with a "Blog" item.

The feedback link can remain in the footer (`src/web/home/Footer.tsx`) — this change is only about the header/drawer.

### 16. Add `blog-site/README.md`

Add a README with setup/dev instructions and a "Adding a New Post" section:

````markdown
# Blog Site

Ameliorate's blog, built with [Nextra](https://nextra.site) using the docs theme for consistency with the docs site.

## Development

```sh
npm install
npm run dev
```
````

Runs at [http://localhost:3009/blog](http://localhost:3009/blog).

## Adding a New Post

1. Create a new directory under `app/posts/` named `<YYYY-MM-DD>-<primary-tag>-<brief-title>/` (e.g. `2026-04-01-update-new-feature/`)
2. Add a `page.mdx` file with frontmatter:

   ```mdx
   ---
   title: "Your Post Title"
   date: YYYY-MM-DDT12:00
   description: "Short description for cards and RSS"
   tags:
     - update
   ---

   import { PostMeta } from "../../components/PostMeta";

   <PostMeta />

   Your content here...
   ```

3. Add the post to `app/posts/_meta.ts` (at the top, since newest goes first):
   ```ts
   "2026-04-01-update-new-feature": "4/1/26: New Feature",
   ```
4. Test locally with `npm run dev` and verify:
   - Post appears in the sidebar and on the All Posts page
   - Post metadata (date, author, tags) renders correctly
   - TOC pane shows headings on the right
5. Push to `main` — Netlify auto-deploys

### Cross-posting to Substack

After the blog post is live on `ameliorate.app/blog`:

1. Copy the rendered content from your new post and paste into Substack's editor
2. In Substack's post editor, click ⋯ or go to **Settings** → look for **"Canonical URL"**
3. Set canonical URL to `https://ameliorate.app/blog/posts/<your-post-slug>`
4. Publish on Substack

This tells search engines that the Ameliorate blog is the original source.

```

### 17. Visual Consistency Verification Step

After migration, open the local blog at `http://localhost:3009/blog` side-by-side with production `https://ameliorate.app/docs` and verify:

- Navbar looks the same (logo, icons, theme switch, "Blog"/"Docs" links)
- Heading styles (h1, h2, h3) match between blog posts and docs pages
- Link styling (color, underline, hover) is consistent
- Sidebar appearance (font, spacing, active highlight) looks similar
- TOC pane on the right mirrors the docs TOC
- Footer rendering is consistent
- Dark mode and light mode both look correct
- Mobile responsive layout (sidebar as hamburger) works

## Summary of File Changes

### Files to modify:

- `blog-site/package.json` — swap `nextra-theme-blog` → `nextra-theme-docs`
- `blog-site/app/layout.tsx` — rewrite to use docs theme Layout/Navbar/Footer
- `blog-site/app/page.tsx` — update PostCard import to custom component
- `blog-site/app/tags/[tag]/page.tsx` — update PostCard import to custom component
- `blog-site/mdx-components.jsx` — switch from blog to docs theme components
- `blog-site/app/custom.css` — review/simplify (may need adjustments for docs theme; `typesetting: 'article'` may make some overrides unnecessary)
- `blog-site/README.md` — replace with comprehensive README including "Adding a New Post" instructions
- All post `page.mdx` files — add `<PostMeta />` import + component (no props needed), remove manual TOC sections

### Files to add:

- `blog-site/app/_meta.ts` — root navigation config (All Posts, Blog/Docs navbar links, hidden routes)
- `blog-site/app/posts/_meta.ts` — sidebar ordering of posts (newest first)
- `blog-site/app/components/PostCard.tsx` — replacement for `nextra-theme-blog`'s PostCard
- `blog-site/app/components/PostMeta.tsx` — author/date/tags component for post headers

### Files unchanged:

- `blog-site/next.config.mjs` — no changes needed (theme-agnostic)
- `blog-site/app/rss.xml/route.ts` — no changes needed (theme-agnostic)
- `blog-site/app/posts/get-posts.ts` — no changes needed (uses core Nextra APIs)
- `blog-site/app/components/YouTube.tsx` — no changes needed
- `blog-site/netlify.toml` — no changes needed
- `blog-site/next-sitemap.config.js` — no changes needed
- `blog-site/postcss.config.cjs` — no changes needed
- `blog-site/tsconfig.json` — no changes needed
- Root `netlify.toml` — no changes needed

### Main app update:

- `src/web/common/components/Header/SiteHeader.tsx` — replace "Feedback" header link with "Blog" link to `/blog`
- `src/web/common/components/SiteDrawer/SiteDrawer.tsx` — replace "Feedback" drawer item with "Blog" item

### Cross-site update:

- `docs-site/app/_meta.ts` — add "Blog" link to navbar (and also a "Docs" self-link for consistency)

## Risks and Open Questions

### Risk: Sidebar maintenance overhead

Every new post requires a `_meta.ts` update. For a low-frequency blog (8 posts over ~3 years), this is negligible. If posting frequency increases, could explore auto-generating `_meta.ts` from the filesystem at build time.

### Risk: `PostCard` styling drift

The custom `PostCard` won't automatically match blog theme updates. But since we're now on the docs theme, this is actually fine — we want it to match the docs theme, which it will since we're using the same Tailwind/Nextra classes.

### Open: `article` typesetting

Enabled by default in `_meta.ts`. Need to test visually whether it looks good for the blog content or if the default is better. Easy to toggle.

### Decided: Sidebar title format

Use `{short date}: {brief title}` format (e.g. "1/6/26: Summarizing, Nonprofit-izing, Communitizing"). This keeps the sidebar compact while showing both when and what.

### Open: Tag page sidebar behavior

When navigating to `/tags/[tag]`, the sidebar will show the full post list (since the `_meta.ts` defines it). This is fine — user can still browse. But the tag page itself won't be highlighted in the sidebar since it's `display: 'hidden'`.

### Resolved: `PostMeta` reads frontmatter automatically

Using `useConfig()` from `nextra-theme-docs`, the `PostMeta` component reads the current page's frontmatter at runtime — no prop duplication needed. Each post just needs `<PostMeta />` with no arguments.

### Open: Both themes' CSS loading?

We should NOT install both `nextra-theme-blog` and `nextra-theme-docs` in the same project. Since we're replacing one with the other, this isn't an issue — just import `nextra-theme-docs/style-prefixed.css` (or `style.css`) instead of `nextra-theme-blog/style.css`.

## Migration Steps

1. Update `package.json`: remove `nextra-theme-blog`, add `nextra-theme-docs`
2. Run `npm install`
3. Add `app/_meta.ts` (root nav config) and `app/posts/_meta.ts` (sidebar ordering)
4. Rewrite `app/layout.tsx` to use docs theme components
5. Update `mdx-components.jsx` to use docs theme components
6. Create custom `PostCard` + `PostMeta` components
7. Update `app/page.tsx` and `app/tags/[tag]/page.tsx` to use custom `PostCard`
8. Add `<PostMeta />` to each post MDX and remove manual TOC sections
9. Review/adjust `custom.css` (check if `typesetting: 'article'` makes overrides unnecessary)
10. Update main app header: replace "Feedback" with "Blog" link in `SiteHeader.tsx` and `SiteDrawer.tsx`
11. Replace `blog-site/README.md` with comprehensive instructions including "Adding a New Post" and Substack cross-posting
12. Update `docs-site/app/_meta.ts` with Blog/Docs navbar links
13. `npm run dev` and test locally
14. Visual comparison: open local blog side-by-side with production `ameliorate.app/docs` and verify style consistency (navbar, headings, links, sidebar, TOC, footer, dark/light mode, mobile)
```
