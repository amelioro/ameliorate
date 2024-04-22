import { initAuth0 } from "@auth0/nextjs-auth0";

const baseURL = process.env.AUTH0_BASE_URL;

/**
 * For some reason, after nextjs 13.4.19 -> 14.2.2 upgrade, letting auth0 create its own instance
 * on usage of `handleAuth` resulted in `TypeError: "baseURL" is required`, but this sets it
 * properly.
 *
 * This is all despite
 * 1. `process.env.AUTH0_BASE_URL` logging the correct value to console before `handleAuth` is called
 * 2. nextjs-auth0 pulling the base url the same exact way https://github.com/auth0/nextjs-auth0/blob/951a24864c61eec98702f91eb7784555d54916da/src/config.ts#L151
 * 3. nextjs-auth0 apparently being set intentionally to handle env vars from `next.config.js`
 * (which is where we're setting it) https://github.com/auth0/nextjs-auth0/blob/951a24864c61eec98702f91eb7784555d54916da/src/config.ts#L148
 */
export const auth0 = initAuth0({
  baseURL,
});
