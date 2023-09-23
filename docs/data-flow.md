# Data Flow

Here are some diagrams to help provide a high-level overview of how data flows through the app, and to illustrate when some tech comes into play.

## Simple load: user page

```mermaid
sequenceDiagram
  autonumber
  actor User
  participant Client
  participant Server as Nextjs API & Web Server
  participant Database as Postgres Database

  User->>Client: Visit /[username]
  Client->>Server: Get page
  Client->>Server: GET /api/auth/me (with session cookie)
  Note right of Client: Check if user is logged in for editability<br/>(nextjs-auth0 endpoint)
  Client->>Server: GET /api/trpc/user.findByUsername
  Note right of Client: Fetch from tRPC endpoint via React Query<br/>for suspense handling & possible caching<br/>(see [username].page.tsx)
  Note right of Client: (could be doing more SSR here)
  Server->>Database: SELECT Query
  Note right of Server: Query generated via Prisma<br/>(see routers/user.ts)

```

## Topic diagram update: add node

```mermaid
sequenceDiagram
  autonumber
  actor User

  box Client
    participant Add Button
    participant Topic Actions
    participant Topic Store
  end

  participant Server as Nextjs API & Web Server
  participant Database as Postgres Database

  User->>Add Button: Click add node button
  Add Button->>Topic Actions: addNode()
  Topic Actions->>Topic Actions: Create Node and Edge(s)
  Topic Actions->>Topic Actions: Re-layout diagram
  Topic Actions->>Topic Actions: Emit event
  Note over Topic Actions: Event so that viewport can move<br/>to include new node if necessary
  Topic Actions->>Topic Store: Update store
  Note over Topic Store: All components using a store hook<br/>check their comparators to see if<br/>they need to re-render

  Note over Topic Store: Beyond this is handled by store middleware
  Topic Store->>Topic Store: Persist new state in local storage
  Topic Store->>Topic Store: Track new state in undo/redo history

  opt If not on playground
    Topic Store->>Topic Store: Identify node, edge, score diffs
    Topic Store->>Server: POST /api/trpc/topic.setData (diffs in payload)
    Note right of Topic Store: (see [apiSyncerMiddleware.ts])
    Server->>Server: Ensure user authorized to create the diffs
    Server->>Database: CREATE, UPDATE, DELETE queries
    Note right of Server: (see routers/topic.ts)
  end

```
