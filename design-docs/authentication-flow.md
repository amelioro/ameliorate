# Authentication flow

Note: this doc is LLM-generated but it seems pretty decent and easy to read.

---

Ameliorate uses `@auth0/nextjs-auth0` v3.6.0. These diagrams show browser login and subsequent session-authenticated tRPC requests, using the SDK's default RS256 token verification and encrypted cookie sessions.

## 1. Login

The backend verifies Auth0's response, then creates an Ameliorate session cookie for the browser.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Browser
    participant Backend as Ameliorate backend<br/>(includes Auth0 SDK)
    participant Auth0
    participant Database as Ameliorate database

    User->>Browser: Click Log in
    Browser->>Backend: GET /api/auth/login
    Backend->>Backend: Prepare login transaction<br/>(state, nonce and PKCE verification)
    Backend-->>Browser: Set transaction cookie<br/>Redirect to Auth0 /authorize
    Browser->>Auth0: Follow redirect
    Auth0-->>Browser: Show login page
    User->>Browser: Complete login
    Browser->>Auth0: Submit login
    Auth0->>Auth0: Authenticate user
    Auth0-->>Browser: Redirect to /api/auth/callback<br/>with authorization code and state
    Browser->>Backend: GET /api/auth/callback?code=...&state=...<br/>Include transaction cookie
    Backend->>Backend: Validate callback state against login transaction
    Backend->>Auth0: POST /oauth/token<br/>Code, PKCE verifier, client ID and AUTH0_CLIENT_SECRET
    Note over Backend,Auth0: AUTH0_CLIENT_SECRET authenticates Ameliorate to Auth0
    Auth0->>Auth0: Validate code, client credentials and PKCE<br/>Sign ID token with Auth0's private key
    Auth0-->>Backend: ID token and access token
    opt Signing keys are needed (discovered from AUTH0_ISSUER_BASE_URL)
        Backend->>Auth0: Fetch public signing keys (JWKS)
        Auth0-->>Backend: Public keys
    end
    Backend->>Backend: Verify ID token signature with Auth0's public key<br/>Check issuer, audience, expiration and nonce
    Note over Backend: Only a valid response can establish a session<br/>Validated claims include sub and email_verified
    Backend->>Database: afterCallback: find user where authId = sub
    Database-->>Backend: Existing user or no matching user
    Backend->>Backend: Encrypt and integrity-protect session<br/>using a key derived from AUTH0_SECRET
    Backend-->>Browser: Set HttpOnly appSession cookie<br/>Redirect to returnTo/profile, or /choose-username for a new user
    Note over Browser,Backend: Browser stores the protected session cookie<br/>HttpOnly prevents browser JavaScript from reading it
```

Auth0's private signing key stays with Auth0. Its public key verifies that the ID token came from the trusted issuer and was not altered. `AUTH0_CLIENT_SECRET` authenticates the application during the token exchange; `AUTH0_SECRET` protects the resulting session cookie.

## 2. Subsequent requests

This example calls a tRPC procedure that uses `isLoggedIn`. The browser automatically sends the session cookie, and the backend verifies it locally before using its user data.

```mermaid
sequenceDiagram
    autonumber
    participant Browser
    participant Backend as Ameliorate tRPC backend
    participant SDK as Auth0 SDK<br/>(inside the backend)
    participant Database as Ameliorate database

    Browser->>Backend: Request /api/trpc/...<br/>Cookie: appSession=...
    Backend->>SDK: createContext calls auth0.getSession(req, res)
    SDK->>SDK: Read cookie and decrypt using AUTH0_SECRET<br/>Verify integrity and session expiration
    Note over Backend,SDK: Ordinary session validation happens locally<br/>No request to Auth0 is needed

    alt Cookie missing, altered or expired
        SDK-->>Backend: No valid session
        Backend->>Backend: Empty authentication context<br/>isLoggedIn rejects the request
        Backend-->>Browser: UNAUTHORIZED
    else Valid session
        SDK-->>Backend: Session with validated user data
        Backend->>Backend: Read session.user.sub and email_verified
        Backend->>Database: Find user where authId = session.user.sub
        Database-->>Backend: Matching user or no matching user
        Backend->>Backend: Build context with identity, user and authSource=session
        alt Email unverified or Ameliorate user missing
            Backend->>Backend: isLoggedIn rejects the request
            Backend-->>Browser: UNAUTHORIZED
        else Verified email and Ameliorate user exists
            Backend->>Backend: isLoggedIn passes<br/>Run procedure's permission checks and operation
            Backend-->>Browser: Procedure result or permission error
        end
    end
```

Public procedures can accept an unauthenticated context. Other procedures can use `isAuthenticated` or `isEmailVerified` to require only part of the `isLoggedIn` checks. The SDK can also renew the cookie according to its rolling-session settings.

### Keys and configuration

| Key or setting             | Role                                                                           |
| -------------------------- | ------------------------------------------------------------------------------ |
| `AUTH0_CLIENT_ID`          | Identifies Ameliorate to Auth0; also used to validate the ID token's audience. |
| `AUTH0_CLIENT_SECRET`      | Authenticates Ameliorate to Auth0 during the token exchange.                   |
| Auth0's public signing key | Verifies the ID token's RS256 signature.                                       |
| `AUTH0_SECRET`             | Protects the session cookie against reading and tampering.                     |
| `AUTH0_ISSUER_BASE_URL`    | Identifies the trusted provider used for discovery and token validation.       |

### Project details

- **Local development:** the mock identity provider takes Auth0's place and supplies test identities.
- **Personal access tokens:** a request with a parsed `Authorization: Bearer ...` token takes the separate PAT path. Ameliorate hashes the token and checks its database record, expiry and revocation status. An invalid PAT does not fall back to cookie authentication.

### Code references

- [Auth0 initialization](../src/api/initAuth0.ts)
- [Login and callback route](../src/pages/api/auth/[...auth0].page.ts)
- [Request authentication context](../src/api/context.ts)
- [Authentication middleware](../src/api/auth.ts)
- [PAT verification](../src/api/personalAccessTokenAuth.ts)
- [Local mock provider](../mock-auth/index.ts)

### Auth0 references

- [Authorization Code Flow](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow)
- [Signing keys](https://auth0.com/docs/get-started/tenant-settings/signing-keys)
- [Next.js authentication and session cookies](https://auth0.com/blog/ultimate-guide-nextjs-authentication-auth0/)
