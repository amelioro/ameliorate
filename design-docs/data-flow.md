# Data Flow

Here are some diagrams to help provide a high-level overview of how data flows through the app, and to illustrate when some tech comes into play.

## Standard page load: user page (see [username].page.tsx)

```mermaid
sequenceDiagram
  autonumber
  actor User
  participant Client
  participant Server as Nextjs API & Web Server
  participant Auth0
  participant Database as Postgres Database

  User->>Client: Visit /[username]
  Client->>Server: Get page
  Server->>Client: Page with no data
  Note right of Client: (could be doing more SSR here)
  Client->>Client: Render page with no data

  opt All pages use this for navbar rendering
    Client->>Server: GET /api/auth/me (with session cookie)
    Server->>Auth0: GET user data
    Auth0->>Server: Auth0 user data
    Server->>Client: Auth0 user data
    Client->>Client: Update page with Auth0 user data
    Client->>Server: GET /api/trpc/user.findByAuthId
    Note right of Client: Fetch from tRPC endpoint via React Query<br/>for suspense handling & possible caching
    Note right of Client: There is an Ameliorate db user for each<br/>Auth0 user
    Server->>Database: SELECT Query
    Note right of Server: Query generated via Prisma<br/>(see routers/user.ts)
    Server->>Client: user
    Client->>Client: Update page with Ameliorate user
  end

  Client->>Server: GET /api/trpc/user.findByUsername
  Note right of Client: Get other data related to user e.g. topics
  Server->>Database: SELECT Query
  Server->>Client: user with other data e.g. topics
  Client->>Client: Update page with user data

```

## Topic diagram update: add node

```mermaid
sequenceDiagram
  autonumber
  actor User

  box Client
    participant Add Button
    participant Topic Store Actions
    participant Topic Store
    participant Topic Store Middleware
    participant Diagram
  end

  participant Server as Nextjs API & Web Server
  participant Database as Postgres Database

  User->>Add Button: Click add node button
  Add Button->>Topic Store Actions: addNode()
  Topic Store Actions->>Topic Store Actions: Emit addNode event so viewport can move<br/>to include new node if necessary
  Topic Store Actions->>Topic Store: Create Node and Edge(s)

  Topic Store->>Topic Store Middleware: Persist new state in local storage
  Topic Store->>Topic Store Middleware: Track new state in undo/redo history

  opt If not on playground
    Topic Store->>Topic Store Middleware: Identify node, edge, score diffs
    Topic Store Middleware->>Server: POST /api/trpc/topic.setData (diffs in payload)
    Note right of Topic Store Middleware: (see [apiSyncerMiddleware.ts])
    Server->>Server: Ensure user authorized to create the diffs
    Server->>Database: CREATE, UPDATE, DELETE queries
    Note right of Server: (see routers/topic.ts)
  end

  Note over Topic Store: All components using a topic store hook<br/>check their comparators to see if<br/>they need to re-render

  opt If nodes or edges changed
    Diagram->>Diagram: calculate new layout

    opt If new layout and addNode event was triggered
      Diagram->>Diagram: Move viewport to include new node
    end
  end
```
