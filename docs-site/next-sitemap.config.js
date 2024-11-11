/** @type {import('next-sitemap').IConfig} */
// eslint-disable-next-line functional/immutable-data
module.exports = {
  siteUrl: "https://ameliorate.app/docs",
  generateIndexSitemap: false, // docs sitemap is going to be pointed at by root site's sitemap index; also we shouldn't ever have more than 50k docs pages
  changefreq: "daily", // docs don't seem like they need to be indexed more than once a day
  priority: 0.5, // match the default of the official sitemaps protocol https://www.sitemaps.org/protocol.html
  autoLastmod: false, // if true, it sets the lastmod for all pages to the time of each build, will be almost always incorrect, because docs don't change nearly as often as the project is deployed
};
