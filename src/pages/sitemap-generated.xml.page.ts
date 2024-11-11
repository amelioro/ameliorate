/**
 * Copied from example at https://nextjs.org/learn-pages-router/seo/crawling-and-indexing/xml-sitemaps
 */

import { GetServerSidePropsContext } from "next";

import { getPublicTopics } from "@/api/topic/topic";
import { getLinkToTopic } from "@/common/topic";
import { getBaseUrl } from "@/common/utils";

const getUrlXml = (loc: string, priority?: number, lastmod?: Date) => {
  const priorityTag = priority ? `<priority>${priority}</priority>` : "";
  const lastModTag = lastmod ? `<lastmod>${lastmod.toISOString()}</lastmod>` : "";

  return `<url><loc>${loc}</loc><changefreq>daily</changefreq>${priorityTag}${lastModTag}</url>`;
};

const generateSiteMap = (publicTopics: Awaited<ReturnType<typeof getPublicTopics>>) => {
  if (publicTopics.length > 49000)
    throw new Error("Sitemap close to exceeding 50k URL limit, need to split up");

  const baseUrl = getBaseUrl();

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${getUrlXml(baseUrl, 1)}
${getUrlXml(baseUrl + "/playground")}
${publicTopics
  .map((topic) => ({ loc: getLinkToTopic(topic), lastmod: topic.updatedAt }))
  .toSorted((a, b) => (a.loc < b.loc ? -1 : 1)) // nicer to read if these are sorted
  .map(({ loc, lastmod }) => getUrlXml(loc, undefined, lastmod))
  .join("\n")}
</urlset>`;
};

const SiteMap = () => {
  // getServerSideProps will do the heavy lifting
};

export const getServerSideProps = async ({ res }: GetServerSidePropsContext) => {
  const publicTopics = await getPublicTopics();
  const sitemap = generateSiteMap(publicTopics);

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default SiteMap;
