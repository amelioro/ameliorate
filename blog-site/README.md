# Blog Site

Ameliorate's blog, built with [Nextra](https://nextra.site) using the docs theme for consistency with the docs site.

## Development

```sh
npm install
npm run dev
```

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
