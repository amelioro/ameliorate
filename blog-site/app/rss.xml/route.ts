import { getPosts } from "../posts/get-posts";

const CONFIG = {
  title: "Ameliorate Blog",
  siteUrl: "https://ameliorate.app/blog",
  description: "Updates and thoughts on Ameliorate — a tool for critically thinking about problems and collaboratively refining our understanding of them.",
  lang: "en-us",
};

export async function GET() {
  const allPosts = await getPosts();
  const posts = allPosts
    .map(
      (post) => `    <item>
        <title>${escapeXml(post.title)}</title>
        <description>${escapeXml(post.frontMatter.description)}</description>
        <link>${CONFIG.siteUrl}${post.route}</link>
        <pubDate>${new Date(post.frontMatter.date).toUTCString()}</pubDate>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${CONFIG.title}</title>
    <link>${CONFIG.siteUrl}</link>
    <description>${CONFIG.description}</description>
    <language>${CONFIG.lang}</language>
${posts}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
