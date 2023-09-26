/**
 * Most of this file is based on nextjs-auth0's local server setup https://github.com/auth0/nextjs-auth0/blob/a5a5dc77d9f7353785c84b1b72d8415f35bad3fb/scripts/oidc-provider.js,
 * but it seems like half of those config options weren't needed (and some made the mock not work),
 * so they've been removed.
 *
 * If something isn't working, that file is probably a good place to start, along with oidc-provider docs https://github.com/panva/node-oidc-provider/blob/main/docs/README.md
 *
 * Probably the most important setting is oidc-provider's devInteractions, which enables the mock pages https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#featuresdevinteractions
 */

import Provider, { type Configuration } from "oidc-provider";

const config: Configuration = {
  clients: [
    {
      client_id: "foo",
      client_secret: "bar",
      redirect_uris: ["http://localhost:3000/api/auth/callback"],
      post_logout_redirect_uris: ["http://localhost:3000"],
      grant_types: ["authorization_code", "refresh_token"],
    },
  ],
  claims: {
    openid: ["sub", "email", "email_verified"],
  },

  // used for reference: https://code.vt.edu/devcom/mock-oidc-provider/-/blob/4cd25df297a1ab702beeee656da0cf72c7c76551/src/oidcServer.js#L84-96
  findAccount: (_, sub) => {
    return {
      accountId: sub,
      claims: () => ({
        sub, // oidc-provider's devInteractions sets this to login name you use; match this with the authId in your db to log in as that user
        email: `${sub}@gmail.com`, // any unique email I guess, in case we decide to use depend on one later
        email_verified: true, // bypass email verification
      }),
    };
  },
  routes: {
    token: "/oauth/token",
    end_session: "/v2/logout",
  },
  scopes: ["openid", "offline_access"],
  clientBasedCORS(_ctx: unknown, _origin: unknown, _client: unknown) {
    return true;
  },
  rotateRefreshToken: true,
};

export default function createProvider(port: number) {
  const issuer = `http://localhost:${port}/`;
  const provider = new Provider(issuer, config);

  provider.use(async (ctx, next) => {
    await next();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (ctx.oidc?.route === "end_session_success") {
      ctx.redirect("http://localhost:3000");
    }
  });

  return provider;
}

const port = 9000;
createProvider(port).listen(port, () => {
  console.log(`> Ready on http://localhost:${port}`);
});
