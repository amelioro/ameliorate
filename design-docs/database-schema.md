# Database Schema

This is intended to provide a high-level visual of the schema, not to show all of the schema's details.

Could consider using [prisma-erd-generator](https://github.com/keonik/prisma-erd-generator), but some relations are not FKs, and some relations are not that useful to show.

Diagram notes:

- 'GraphPart' refers to Node or Edge; it is not actually its own table.
- Replaced some topic relations with `topicId` attribute to reduce chaotic number of edges.

## Core tables

```mermaid
classDiagram
  Topic --> User: creatorName

  Comment --> User: authorName
  Comment --> GraphPart: parentId

  UserScore --> User: username
  UserScore --> GraphPart: graphPartId


  Node ..> GraphPart : is a
  Edge ..> GraphPart : is a

  Edge --> Node: targetId
  Edge --> Node: sourceId

  View --> Topic: topicId

  class Node {
    topicId
  }

  class Edge {
    topicId
  }

  class UserScore {
    topicId
  }

  note for Comment "parentId can also refer to a Comment"
  class Comment {
    topicId
  }

```

## Notifications-related tables

```mermaid
classDiagram
  InAppNotification --> User: notifiedUsername

  Watch --> User: watcherUsername

  Subscription --> User: subscriberUsername
  Subscription --> Comment: subscriptionSourceId

  UnsubscribeCode --> User: subscriberUsername
  UnsubscribeCode --> Comment: subscriptionSourceId

  class Watch {
    topicId
  }
```
