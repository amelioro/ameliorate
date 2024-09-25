# Database Schema

This is intended to provide a high-level visual of the schema, not to show all of the schema's details.

Could consider using [prisma-erd-generator](https://github.com/keonik/prisma-erd-generator), but some relations are not FKs, and some relations are not that useful to show.

Diagram notes:

- 'GraphPart' refers to Node or Edge; it is not actually its own table.
- Replaced some topic relations with `topicId` attribute to reduce chaotic number of edges.

```mermaid
classDiagram
  Topic --> User: creatorName

  Node ..> GraphPart : is a
  Edge ..> GraphPart : is a

  Edge --> Node: targetId
  Edge --> Node: sourceId

  UserScore --> User: username
  UserScore --> GraphPart: graphPartId

  View --> Topic: topicId

  Comment --> User: authorName
  Comment --> GraphPart: parentId
  Comment --> Comment: parentId

  InAppNotification --> User: notifiedUsername

  Watch --> User: watcherUsername
  Watch --> Topic: topicId

  Subscription --> User: subscriberUsername
  Subscription --> Comment: subscriptionSourceId

  UnsubscribeCode --> User: subscriberUsername
  UnsubscribeCode --> Comment: subscriptionSourceId

  class Node {
    topicId
  }

  class Edge {
    topicId
  }

  class UserScore {
    topicId
  }

  class Comment {
    topicId
  }
```
