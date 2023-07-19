/**
 * Prevent users from being created with these names, since usernames
 * are used as endpoints, and aren't behind a standard users/ route.
 *
 * Taken some guidance from quora: collisions should be unlikely but worst-case we can force a name change
 * (https://www.quora.com/How-do-sites-prevent-vanity-URLs-from-colliding-with-future-features)
 *
 * Many of these names were taken from https://github.com/shouldbee/reserved-usernames
 */
export const reservedFirstLevelEndpointNames = [
  "about",
  "accessibility",
  "account",
  "activities",
  "admin",
  "all",
  "api",
  "app",
  "archive",
  "blog",
  "business",
  "categories",
  "chat",
  "comments",
  "communities",
  "community",
  "compare",
  "contact",
  "contribute",
  "dashboard",
  "data",
  "demo",
  "demos",
  "design",
  "dev",
  "discussion",
  "docs",
  "edu",
  "enterprise",
  "events",
  "examples",
  "explanation",
  "explore",
  "faq",
  "favorites",
  "features",
  "feedback",
  "gov",
  "groups",
  "guide",
  "guides",
  "help",
  "hosting",
  "ideas",
  "images",
  "jobs",
  "learn",
  "login",
  "logout",
  "maintenance",
  "me",
  "media",
  "new",
  "news",
  "org",
  "organizations",
  "partners",
  "plans",
  "polls",
  "popular",
  "privacy",
  "projects",
  "search",
  "security",
  "settings",
  "signup",
  "solve",
  "stats",
  "status",
  "stories",
  "system",
  "team",
  "tech",
  "terms",
  "topics",
  "tour",
  "tutorial",
  "users",
  "volunteer",
  "welcome",
  "wiki",
];

/**
 * Prevent topics from being created with these names, since topic titles
 * are used as endpoints, and aren't behind a standard topics/ route.
 *
 * Taken some guidance from quora: collisions should be unlikely but worst-case we can force a name change
 * (https://www.quora.com/How-do-sites-prevent-vanity-URLs-from-colliding-with-future-features)
 *
 * Many of these names were taken from https://github.com/shouldbee/reserved-usernames
 */
export const reservedSecondLevelEndpointNames = [
  "account",
  "followers",
  "following",
  "new",
  "settings",
  "stats",
  "topics",
];
