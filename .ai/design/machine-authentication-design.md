# Machine Authentication Design

## Purpose

Ameliorate needs a way for machines to make authenticated API requests without depending on repeated cookie extraction by a human or a browser UI.

The desired result is straightforward: a machine request should be able to act as an Ameliorate user and reach the same authenticated API behavior that browser requests reach today.

## Current Authentication Architecture

Authenticated API access is currently based on the Auth0 session managed by `@auth0/nextjs-auth0`.

- [src/api/README.md](../src/api/README.md) documents authenticated API usage in terms of the `appSession` cookie taken from the browser
- [src/pages/api/trpc/[trpc].page.ts](../src/pages/api/trpc/%5Btrpc%5D.page.ts) routes all tRPC requests through `createContext`
- [src/api/context.ts](../src/api/context.ts) builds request auth context by calling `auth0.getSession(req, res)`
- [src/api/auth.ts](../src/api/auth.ts) authorizes protected procedures through three layered middlewares that check progressively stricter conditions: `isAuthenticated` requires `userAuthId`, `isEmailVerified` additionally requires `userEmailVerified`, and `isLoggedIn` additionally requires a `user` record in the database

In practice, this means the API currently trusts the session cookie created by `nextjs-auth0`, not an arbitrary bearer token.

## Requirements

Any machine-authentication design should satisfy these requirements:

- no routine manual extraction of browser cookies
- no browser UI required for normal operation
- requests should resolve to an Ameliorate user so existing authorization logic continues to work
- credentials should be suitable for repeated automated use over time

The third requirement is especially important. In the current architecture, authenticated tRPC behavior depends on `createContext` resolving the request to the same effective user shape that browser requests produce today.

## Important Credential Distinction

Two different kinds of credentials are relevant here.

### `appSession`

The current API accepts the `appSession` cookie managed by `@auth0/nextjs-auth0`.

That cookie represents the SDK-managed session that `auth0.getSession(req, res)` knows how to read.

### Auth0 OAuth/OIDC Tokens

Auth0 token endpoints such as `/oauth/token` can return:

- access tokens
- ID tokens
- refresh tokens

These are OAuth/OIDC bearer credentials. They are not the same thing as Ameliorate's current `appSession`-based session model.

### Why the Distinction Matters

Today, Ameliorate does not validate Auth0 bearer tokens on API requests. It only reads the `nextjs-auth0` session cookie through `auth0.getSession(req, res)`.

As a result, receiving a token from Auth0 is not enough by itself to authenticate current tRPC requests. The backend would need to change either to validate Auth0 bearer tokens directly or to exchange them for a credential that the current session model understands.

## Identity Model

There are two common ways a machine might act:

- as a dedicated Ameliorate user, such as `copilot-user`
- on behalf of an individual human user's Ameliorate account

For the recommended app-native token approach, this distinction is not a major architecture fork. In both cases, the request still resolves to an Ameliorate user.

The distinction matters more for Auth0-native approaches, because some flows identify an application and some identify a user.

## Option Evaluation

### Baseline: Current Manual `appSession` Strategy

This is the current approach described in [src/api/README.md](../src/api/README.md): log in through the browser, extract the `appSession` cookie, and send it with API requests.

This does not meet the requirements.

The `@auth0/nextjs-auth0` SDK does allow session duration to be configured through settings such as `rolling`, `absoluteDuration`, and `inactivityDuration`. That means the session lifetime can be extended beyond the defaults. However, the documented model is still a finite session with an absolute expiration, not an explicitly permanent session.

Because of that, this should not be treated as a reliable long-term machine-authentication design. At best, it could reduce how often manual setup is needed. It would still depend on a browser-session artifact and a one-time manual bootstrap.

### Option 1: Programmatically Obtain a Fresh `appSession`

One possibility is to script the existing login flow and store the resulting `appSession` cookie.

This could be done with a headless browser, or in some cases with a lower-level HTTP client that handles redirects, form submission, and cookies. It would reuse the same session-cookie path that the API already accepts.

#### Strengths

- no backend code changes
- compatible with the current API immediately
- avoids manual cookie extraction after initial setup

#### Weaknesses

- still depends on browser-oriented login flow behavior rather than a stable machine-auth contract
- likely requires storing a real Auth0 username and password
- fragile in the face of MFA, CAPTCHA, social login, enterprise SSO, or login-page changes
- session expiry still exists, so the login flow must be repeated periodically
- does not fully satisfy a strict "API-only" requirement

#### Assessment

This is the closest workaround that avoids backend changes, but it is still a workaround. It falls short of the desired end state.

### Option 2: App-Native API Keys or Personal Access Tokens

Under this approach, Ameliorate would issue its own machine credentials.

The machine would send a token in a header such as `Authorization: Bearer <token>` or `X-API-Key: <token>`. The backend would validate that token, load the associated Ameliorate user, and build the same request auth context that browser-session requests use today.

#### Why This Fits the Current Codebase

- the current authorization model is already centered on loading an Ameliorate user from the database
- authenticated tRPC behavior already works once `createContext` resolves to that user
- the same mechanism works whether the credential belongs to a service user or an individual user
- [src/api/README.md](../src/api/README.md) already hints at future user-specific API keys

#### Likely Implementation Shape

- add a table for machine credentials with fields such as `id`, `userId`, `name`, `tokenHash`, `tokenPrefix`, `createdAt`, `lastUsedAt`, `expiresAt`, and `revokedAt`
- generate tokens once, show the plaintext only at creation time, and store only a secure hash in the database
- extend [src/api/context.ts](../src/api/context.ts) to check for an API key header before calling `auth0.getSession(req, res)`, and skip the session check entirely when a valid API key is present. This avoids unnecessary `getSession` overhead and sidesteps edge cases where both an API key and a session cookie are present for different users. If no API key header is found, fall through to the existing session-cookie path.
- when a valid token is found, load the corresponding user and populate the context: set `userAuthId` from the user's `authId` field in the database (the same Auth0 `sub` value used in session-based auth, so downstream code behaves identically), set `userEmailVerified` to `true` (since a user must already be logged in with a verified email to create a key), and load the `user` record
- keep the current browser-session path unchanged
- add automated API tests for valid tokens, revoked tokens, expired tokens, malformed tokens, and precedence rules when multiple auth mechanisms are present

#### Design Notes

Hashing the token reduces the blast radius of a database leak. If plaintext bearer tokens are stored in the database and that database leaks, those tokens are immediately usable. With hashing, a database leak does not automatically become token compromise. SHA-256 is the recommended hash algorithm. Unlike passwords, API tokens are generated with high entropy (typically 256 bits), so a slow adaptive hash like bcrypt is unnecessary. SHA-256 is fast, widely available, and standard practice for hashing high-entropy secrets such as API tokens.

Rate limiting should be considered as part of or alongside the implementation. The current codebase has no rate-limiting infrastructure. Browser sessions are naturally rate-limited by human interaction speed, but API keys enable fully automated request volumes. Without rate limiting, a single compromised or misused key could generate excessive load. The rate-limiting design itself is out of scope for this document, but it should be treated as a related implementation concern rather than a later extra.

Scopes are not needed for the current requirements. The design goal is for a machine token to act with the full privileges of the associated user, not with a narrower permission set.

Rotation is also not needed for the current requirements. Revoke plus recreate is functionally sufficient, and there is no current need for a more specialized rollover mechanism.

`tokenPrefix` is a non-sensitive identifier that helps with display, auditing, and locating a token record without storing or showing the full token.

A user-facing settings page for issuing and revoking tokens should be part of the implementation, not a later extra, since the UI should be easy enough once the backend support exists. Ameliorate does not currently have a settings or account-management page. For now, PAT management should live on a deliberately hidden page at `/hidden-settings` rather than being linked from the `UserDrawer`.

#### Relationship to Future OAuth or SSO Work

App-native tokens solve trusted automation well, but they do not themselves provide a standard "connect your Ameliorate account" flow for third-party apps.

If Ameliorate later needs delegated OAuth, federation, or broader SSO integration, those capabilities would still require a standards-based bearer-token design. App-native tokens are therefore complementary to that future work, not a replacement for it.

This also means Option 2 does not materially solve the scenario described in [issue #660](https://github.com/amelioro/ameliorate/issues/660), which is about reusing authentication from another app. However, it also should not make that future work harder if `createContext` is designed to support multiple credential types cleanly.

#### Assessment

This is the best fit for the current codebase and the clearest path to meeting the stated requirements.

### Option 3: Auth0 Bearer-Token Support for the API

Another approach is to make Ameliorate accept Auth0-issued bearer tokens directly.

Under this design, Ameliorate would be configured as a custom API in Auth0. Callers would obtain access tokens for that API, and the backend would validate those tokens, map them to an Ameliorate user or machine principal, and build the request auth context from them.

#### Strengths

- standard OAuth design
- stronger fit for future delegated access and third-party integrations
- better alignment with future SSO or federation goals such as issue `#660`

#### Weaknesses

- requires both Auth0 configuration and backend changes
- more complex than app-native machine tokens
- still needs application-side logic to map claims to an Ameliorate user
- `@auth0/nextjs-auth0` does not provide this automatically for the current API

#### Assessment

This is the stronger standards-based direction, but it is more complexity than is necessary if the immediate goal is trusted machine access to Ameliorate's own API.

### Option 4: Auth0 Client Credentials

Auth0's Client Credentials flow issues tokens to an application rather than to a user.

This is appropriate for service-principal style access, but it does not naturally satisfy a design where machine requests are meant to act as a specific Ameliorate user.

It would therefore still require Ameliorate to introduce its own mapping from machine principal to user. Once that mapping exists, app-native tokens are usually the simpler design.

#### Assessment

This is not a good fit for the current requirement.

### Option 5: Auth0 User-Delegated OAuth With Refresh Tokens

This approach would have a user authorize the machine once, then allow the machine to keep a refresh token and obtain fresh access tokens over time. Typical entry points are Authorization Code with PKCE or Device Authorization Flow with `offline_access`.

This is the best Auth0-native model for long-lived delegated user access.

However, it still requires backend changes because the current API does not accept Auth0 bearer tokens directly.

#### Assessment

This becomes attractive if delegated per-user access becomes a primary product requirement and the added standards-based complexity is worth it.

### Option 6: Auth0 Resource Owner Password Grant

This flow sends a user's username and password directly to Auth0's token endpoint to obtain tokens.

It avoids browser UI, but it still does not fit the current API as-is, because the result is an Auth0 token rather than the `appSession` cookie that the current API understands.

Even if this flow were allowed operationally, it would only become useful after backend changes to accept Auth0 bearer tokens directly or to exchange them into the current session/context model.

#### Assessment

This is a weaker design than either app-native machine tokens or proper Auth0 bearer-token support.

## Comparison Summary

| Approach                                  | Meets stated requirements | Needs backend/API changes | Avoids browser UI                   | Notes                                                        |
| ----------------------------------------- | ------------------------- | ------------------------- | ----------------------------------- | ------------------------------------------------------------ |
| Current manual `appSession` cookie        | No                        | No                        | No                                  | Baseline only                                                |
| Programmatic login to obtain `appSession` | Partial                   | No                        | Yes                                 | Best workaround, but still not a clean machine-auth contract |
| App-native API keys or PATs               | Yes                       | Yes                       | Yes                                 | Best pragmatic fit for the current architecture              |
| Auth0 bearer-token support                | Yes                       | Yes                       | Yes                                 | Best standards-based fit                                     |
| Auth0 Client Credentials                  | No                        | Yes                       | Yes                                 | Identifies an application, not a user                        |
| Auth0 delegated OAuth + refresh tokens    | Yes                       | Yes                       | Mostly, after initial authorization | Best Auth0 path for delegated user access                    |
| Auth0 password grant                      | No                        | Yes                       | Yes                                 | Still does not match the current API shape                   |

## Recommendation

The recommended long-term design is app-native API keys or personal access tokens.

This approach:

- directly addresses the actual integration point in the current architecture, which is `createContext`
- keeps the existing `isLoggedIn`-based authorization model largely unchanged
- satisfies the requirement to avoid manual cookie handling and browser dependence
- is simpler than turning Ameliorate into a full Auth0 resource server before that is clearly needed

There is no no-code option that fully satisfies the stated requirements.

If a temporary workaround is needed without backend changes, the best candidate is programmatic re-login to obtain `appSession`. That can reduce manual work, but it remains a workaround built on browser-session mechanics rather than a clean machine-authentication API.

If cross-app SSO, delegated OAuth, or issue `#660` becomes a near-term priority, then Auth0 bearer-token support becomes more attractive despite the added complexity.

## Relevant External Docs

- Auth0 Next.js SDK session handling: `getSession(req, res)` and session-protected API routes
- Auth0 Client Credentials flow for machine-to-machine access
- Auth0 Device Authorization Flow for non-browser delegated login
- Auth0 refresh tokens and `offline_access`
- Auth0 Resource Owner Password Grant limitations
