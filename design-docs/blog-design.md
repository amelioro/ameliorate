# Blog Design

## Requirements

1. Write blog posts in MDX/Markdown
2. Tag support (e.g. `update`, `reasoning tech`) with frontmatter
3. Default view shows all posts; users can filter by clicking a tag
4. RSS feed at a stable URL so users can subscribe
5. Continue posting on Substack (cross-post from `/blog`, set canonical URL back to `ameliorate.app/blog/...`)
6. Import existing Substack posts into the new blog

## Existing Substack Posts to Import

All would be tagged `update`:

| Date       | Title                                                                 | Substack URL                                                                                 |
| ---------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 2023-05-12 | A Dream to Ameliorate                                                 | https://amelioro.substack.com/p/a-dream-to-ameliorate-547353f37945                           |
| 2023-09-25 | Ameliorate Update 9/25/23: Sharing and Comparing                      | https://amelioro.substack.com/p/ameliorate-update-9-25-23-sharing-and-comparing-208a788fee8d |
| 2024-01-08 | Ameliorate Update 1/8/24: A Place for Everything                      | https://amelioro.substack.com/p/ameliorate-update-1824-a-place-for                           |
| 2024-03-18 | Ameliorate Update 3/18/24: A Better View                              | https://amelioro.substack.com/p/ameliorate-update-31824-a-better                             |
| 2024-09-03 | Ameliorate Update 9/3/24: Feature Bonanza                             | https://amelioro.substack.com/p/ameliorate-update-9324-feature-bonanza                       |
| 2024-12-12 | Ameliorate Update 12/12/24: Reducing Clutter                          | https://amelioro.substack.com/p/ameliorate-update-121224-reducing                            |
| 2026-01-06 | Ameliorate Update 1/6/26: Summarizing, Nonprofit-izing, Communitizing | https://amelioro.substack.com/p/ameliorate-update-1626-summarizing                           |
| 2025-05-16 | Ameliorate Update 5/15/25: Socializing                                | https://amelioro.substack.com/p/ameliorate-update-51525-socializing                          |

## Decision: Separate Project vs. Adding Blog to docs-site

### Option A: New separate `blog-site/` project (using `nextra-theme-blog`)

Pros:

- Clean separation — blog theme (`nextra-theme-blog`) and docs theme (`nextra-theme-docs`) have fundamentally different layouts, components, and conventions. No risk of config conflicts.
- Each project can be updated independently.
- Matches the established pattern already used for `docs-site/`.

Cons:

- Another Netlify site to create and maintain (though the proxy pattern is already established).
- Two separate `package.json` / dependency sets to keep up to date.

### Option B: Add blog pages inside docs-site (using `nextra-theme-docs`)

Pros:

- One fewer project/deployment to manage.
- Shared dependencies and config.

Cons:

- `nextra-theme-docs` doesn't provide blog-specific components (`PostCard`, tag pages, etc.) — you'd have to build them yourself.
- The docs sidebar, navbar, and layout would wrap blog pages, which is a poor UX for a blog.
- Mixing two conceptually different content types in one project makes the `_meta.ts` and routing more complex.

### Decision: Option A (separate `blog-site/` project)

The Nextra blog theme provides built-in support for everything needed (post listing, tags, `PostCard` component, RSS route). Using it in its own project keeps concerns clean and mirrors the established docs-site pattern. The deployment overhead is minimal — it's one more Netlify redirect block in the root `netlify.toml`, which is a pattern already proven with `/docs`.

The config differences between blog and docs projects are real but small (different Nextra theme, different `basePath`, different layout). They wouldn't be confusing to switch between because the projects are structurally similar (both are Nextra + Next.js App Router).

## Architecture

### Proxying (same as docs-site pattern)

The main app at `ameliorate.app` proxies `/blog` to a separate Netlify site via redirects in the root `netlify.toml`:

```toml
# already exists for docs:
[[redirects]]
  from = "/docs"
  to = "https://ameliorate-docs.netlify.app/docs"
  status = 200
  force = true

[[redirects]]
  from = "/docs/*"
  to = "https://ameliorate-docs.netlify.app/docs/:splat"
  status = 200
  force = true

# new for blog:
[[redirects]]
  from = "/blog"
  to = "https://ameliorate-blog.netlify.app/blog"
  status = 200
  force = true

[[redirects]]
  from = "/blog/*"
  to = "https://ameliorate-blog.netlify.app/blog/:splat"
  status = 200
  force = true
```

The blog-site Next.js config sets `basePath: "/blog"` (same idea as docs-site's `basePath: "/docs"`).

The root `netlify.toml` `[build].ignore` command should be updated to also exclude `blog-site/`:

```toml
[build]
  ignore = "! git diff --name-only $CACHED_COMMIT_REF $COMMIT_REF | grep -v -q -E '(docs-site|blog-site)'"
```

### Blog-site Netlify site

Create a new Netlify site (e.g. `ameliorate-blog`) pointed at the same repo, with:

- **Base directory:** `blog-site`
- **Build command:** `npm run build`
- **Publish directory:** `blog-site/.next`
- **`blog-site/netlify.toml`:** empty (same as docs-site, prevents root config from being used)

### Project Structure

Post directory names follow the format `<date>-<primary-tag>-<brief-title>`, e.g. `2024-09-03-update-feature-bonanza`. This makes posts easy to find by date in the filesystem.

```
blog-site/
  netlify.toml                   # empty, same pattern as docs-site
  next.config.mjs
  next-sitemap.config.js         # sitemap generation config
  package.json
  tsconfig.json
  mdx-components.jsx
  postcss.config.cjs
  app/
    layout.tsx                   # root layout with nextra-theme-blog
    page.tsx                     # /blog landing: clickable tags + all posts by recency
    rss.xml/
      route.ts                   # RSS feed generation
    posts/
      get-posts.ts               # helper to get & sort posts, extract tags
      2023-05-12-update-dream-to-ameliorate/
        page.mdx
      2023-09-25-update-sharing-and-comparing/
        page.mdx
      2024-01-08-update-a-place-for-everything/
        page.mdx
      2024-03-18-update-a-better-view/
        page.mdx
      2024-09-03-update-feature-bonanza/
        page.mdx
      2024-12-12-update-reducing-clutter/
        page.mdx
      2025-05-16-update-socializing/
        page.mdx
      2026-01-06-update-summarizing-nonprofitizing/
        page.mdx
    tags/
      [tag]/
        page.tsx                 # /tags/:tag filtered listing
  public/
    sitemap.xml                  # generated by next-sitemap
```

### Key Config Files

**`blog-site/next.config.mjs`**

```js
import nextra from "nextra";

const withNextra = nextra({});

export default withNextra({
  basePath: "/blog",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ameliorate.app" },
      { protocol: "https", hostname: "substackcdn.com" },
      { protocol: "https", hostname: "github.com", pathname: "/user-attachments/assets/**" },
    ],
  },
});
```

**`blog-site/package.json`** (key deps)

```json
{
  "dependencies": {
    "next": "^15.5.10",
    "nextra": "^4.2.16",
    "nextra-theme-blog": "^4.2.16",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next-plausible": "^3.12.4",
    "next-sitemap": "^4.2.3"
  }
}
```

### Sitemap

Use `next-sitemap` (same as docs-site) to generate a sitemap. Add a `next-sitemap.config.js` and a `postbuild` script. The sitemap will be sorted to avoid non-deterministic ordering (same issue and fix as docs-site).

### Post Format (MDX frontmatter)

Each post is an MDX file with frontmatter:

```mdx
---
title: "Ameliorate Update 9/3/24: Feature Bonanza"
date: 2024-09-03
description: "A lot of new features for one post 😅"
tags:
  - update
---

Post content here...
```

### Tags & Filtering

Nextra blog theme provides this out of the box:

- **`get-posts.ts`**: Uses `nextra/page-map` + `nextra/normalize-pages` to read all posts and extract tags from frontmatter.
- **`/blog` landing page (`app/page.tsx`)**: Shows clickable tag links at the top (each tag shows count) + all posts sorted by recency. Uses `PostCard` from `nextra-theme-blog`. This is the main entry point — no separate `/posts` page needed.
- **`/tags/[tag]` page**: Filters posts to only those matching the clicked tag. Uses `generateStaticParams` for SSG.

### RSS Feed

Nextra blog theme documents an RSS route at `app/rss.xml/route.ts`. This generates XML from the posts list.

The RSS feed URL will be `ameliorate.app/blog/rss.xml`.

## Substack Cross-Posting Workflow

### Setting a Canonical URL on Substack

Substack supports canonical URLs. When creating/editing a post on Substack:

1. Open the post editor
2. Click the **⋯** (three dots) menu or go to **Settings** in the post editor
3. Look for **"Canonical URL"** (under SEO settings / advanced settings)
4. Set it to `https://ameliorate.app/blog/posts/<slug>`

This tells search engines that the Ameliorate blog is the original source, preventing duplicate content penalties.

### Recommended Workflow for New Posts

1. Write the post as an MDX file in `blog-site/app/posts/<slug>/page.mdx`
2. Push to `main` — Netlify auto-deploys the blog site
3. Copy the rendered content from `ameliorate.app/blog/posts/<slug>` and paste into Substack's editor
4. In Substack's post settings, set the canonical URL to `https://ameliorate.app/blog/posts/<slug>`
5. Publish on Substack

### Importing Existing Substack Posts

For the initial import, each existing Substack post needs to be converted to MDX:

1. Fetch the HTML content from each Substack URL
2. Convert HTML to Markdown (a tool like `turndown` or manual copy-paste from Substack's editor works)
3. Add frontmatter (title, date, description, tags)
4. Place as `page.mdx` in the appropriate `posts/<slug>/` directory

After the import, the old Substack posts' canonical URLs should be updated to point to the new `/blog` URLs (manual step — update each post's settings in Substack's editor).

## Implementation Steps

Steps 1–5 and 7 can be done in code before the Netlify site exists. Step 6 is a manual Netlify setup step.

1. **Scaffold `blog-site/`** — Create the project with `nextra-theme-blog`, `next.config.mjs` (with `basePath: "/blog"`), layout, mdx-components, sitemap config
2. **Add landing page + tag infrastructure** — `get-posts.ts`, `/blog` landing page (`app/page.tsx`), `/tags/[tag]` page
3. **Add RSS route** — `app/rss.xml/route.ts`
4. **Import existing Substack posts** — Fetch HTML from each Substack URL, convert to MDX with frontmatter
5. **Update root `netlify.toml`** — Add `/blog` proxy redirects and update the build ignore pattern
6. **Update existing links** — Update docs-site intro page and any other references to point to `/blog` alongside the Substack link
7. **Create Netlify site** _(manual)_ — Set up `ameliorate-blog` on Netlify with base directory `blog-site`
8. **Update old Substack canonical URLs** _(manual)_ — For each existing Substack post, set canonical URL to the corresponding `ameliorate.app/blog/posts/<slug>` URL
9. **Verify Substack canonical URL workflow** — Test the cross-posting flow with a new post

## Resolved Decisions

- **Blog landing page**: `/blog` shows clickable tags + all posts sorted by recency. No intro page, no redirect.
- **Old Substack canonical URLs**: Yes, update them (manual step after deployment).
- **Plausible analytics**: Yes, include `next-plausible`.
- **Post URL slugs**: `<date>-<primary-tag>-<brief-title>` format, e.g. `2024-09-03-update-feature-bonanza`.
- **Search**: No Pagefind at this time.
- **Sitemap**: Yes, use `next-sitemap` (same approach as docs-site).
