/* eslint-disable @typescript-eslint/no-unused-vars -- assign names to seeded records even if unused, should make maintenance easier */

import { v4 as uuid } from "uuid";


import { RelationName } from "../src/common/edge";
import { NodeType } from "../src/common/node";
import { xprisma } from "../src/db/extendedPrisma";

import { Edge, Node } from "@/db/generated/prisma/client";

const seed = async () => {
  const testUser = await xprisma.user.upsert({
    where: { username: "examples" },
    update: {},
    create: {
      username: "examples",
      authId: "oauth-test-user",
      email: "oauth-test-user@test.test",
    },
  });

  // delete topic and recreate data to make sure it's all fresh if we change this file
  const topicToDelete = await xprisma.topic.findUnique({
    where: { title_creatorName: { creatorName: testUser.username, title: "cars-going-too-fast" } },
  });
  if (topicToDelete) await xprisma.topic.delete({ where: { id: topicToDelete.id } });

  const topicCarsGoingTooFast = await xprisma.topic.create({
    data: {
      creatorName: testUser.username,
      title: "cars-going-too-fast",
    },
  });

  // nodes
  const createNode = async (type: NodeType, text: string, rootArgued?: Node | Edge) => {
    const id = uuid();

    return await xprisma.node.create({
      data: {
        id: id,
        topicId: topicCarsGoingTooFast.id,
        arguedDiagramPartId: rootArgued?.id,
        type: type,
        text: text,
      },
    });
  };

  const nodeCarsGoingTooFast = await createNode("problem", "cars going too fast in neighborhood");
  const nodeCarsGoingTooFastRootClaim = await createNode(
    "rootClaim",
    '"cars going too fast in neighborhood" is important',
    nodeCarsGoingTooFast,
  );
  const nodeInexpensive = await createNode("criterion", "inexpensive");
  const nodeConveysReasoning = await createNode("criterion", "conveys reasoning to slow down");
  const nodeGetsCarsToSlow = await createNode("criterion", "actually gets cars to slow down");
  const nodeStoplight = await createNode("solution", "stoplight");
  const nodeStopSign = await createNode("solution", "stop sign");
  const nodeSpeedBump = await createNode("solution", "speed bump");
  const nodeSpeedBumpRootClaim = await createNode(
    "rootClaim",
    '"speed bump" is important',
    nodeSpeedBump,
  );
  const nodeKidsAtPlaySign = await createNode("solution", "kids at play sign");
  const nodeLittleKidsLive = await createNode(
    "support",
    "little kids live here and can be hit",
    nodeCarsGoingTooFast,
  );
  const nodeMeasuredTraffic = await createNode(
    "critique",
    "we measured traffic years ago, and it wasn't a problem",
    nodeCarsGoingTooFast,
  );
  const nodeGentrification = await createNode(
    "critique",
    "recent gentrification beyond bottom of hill giving reason to zoom",
    nodeCarsGoingTooFast,
  );
  const nodeCarsZipping = await createNode(
    "support",
    "visually see cars zipping by all the time",
    nodeCarsGoingTooFast,
  );
  const nodeThoroughfare = await createNode(
    "critique",
    "thoroughfare for emergency vehicles",
    nodeSpeedBump,
  );

  // edges
  const createEdge = async (source: Node, type: RelationName, target: Node) => {
    const id = uuid();

    return await xprisma.edge.create({
      data: {
        id: id,
        topicId: topicCarsGoingTooFast.id,
        arguedDiagramPartId: source.arguedDiagramPartId, // if the node is in the claim tree, the edge will be too
        type: type,
        sourceId: source.id,
        targetId: target.id,
      },
    });
  };

  const edgeFastInexpensive = await createEdge(
    nodeInexpensive,
    "criterionFor",
    nodeCarsGoingTooFast,
  );
  const edgeFastConveys = await createEdge(
    nodeConveysReasoning,
    "criterionFor",
    nodeCarsGoingTooFast,
  );
  const edgeFastSlow = await createEdge(nodeGetsCarsToSlow, "criterionFor", nodeCarsGoingTooFast);
  const edgeFastStoplight = await createEdge(nodeStoplight, "addresses", nodeCarsGoingTooFast);
  const edgeFastStopSign = await createEdge(nodeStopSign, "addresses", nodeCarsGoingTooFast);
  const edgeFastBump = await createEdge(nodeSpeedBump, "addresses", nodeCarsGoingTooFast);
  const edgeFastPlay = await createEdge(nodeKidsAtPlaySign, "addresses", nodeCarsGoingTooFast);
  const edgeInexpensiveLight = await createEdge(nodeStoplight, "fulfills", nodeInexpensive);
  const edgeInexpensiveSign = await createEdge(nodeStopSign, "fulfills", nodeInexpensive);
  const edgeInexpensiveBump = await createEdge(nodeSpeedBump, "fulfills", nodeInexpensive);
  const edgeInexpensivePlay = await createEdge(nodeKidsAtPlaySign, "fulfills", nodeInexpensive);
  const edgeConveysLight = await createEdge(nodeStoplight, "fulfills", nodeConveysReasoning);
  const edgeConveysSign = await createEdge(nodeStopSign, "fulfills", nodeConveysReasoning);
  const edgeConveysBump = await createEdge(nodeSpeedBump, "fulfills", nodeConveysReasoning);
  const edgeConveysPlay = await createEdge(nodeKidsAtPlaySign, "fulfills", nodeConveysReasoning);
  const edgeSlowLight = await createEdge(nodeStoplight, "fulfills", nodeGetsCarsToSlow);
  const edgeSlowSign = await createEdge(nodeStopSign, "fulfills", nodeGetsCarsToSlow);
  const edgeSlowBump = await createEdge(nodeSpeedBump, "fulfills", nodeGetsCarsToSlow);
  const edgeSlowPlay = await createEdge(nodeKidsAtPlaySign, "fulfills", nodeGetsCarsToSlow);
  const edgeFastRootClaimLittle = await createEdge(
    nodeLittleKidsLive,
    "supports",
    nodeCarsGoingTooFastRootClaim,
  );
  const edgeFastImportantMeasured = await createEdge(
    nodeMeasuredTraffic,
    "critiques",
    nodeCarsGoingTooFastRootClaim,
  );
  const edgeMeasuredGentrification = await createEdge(
    nodeGentrification,
    "critiques",
    nodeMeasuredTraffic,
  );
  const edgeFastImportantZipping = await createEdge(
    nodeCarsZipping,
    "supports",
    nodeCarsGoingTooFastRootClaim,
  );
  const edgeBumpRootClaimThoroughfare = await createEdge(
    nodeThoroughfare,
    "critiques",
    nodeSpeedBumpRootClaim,
  );

  const nodeInexpensiveLightRootClaim = await createNode(
    "rootClaim",
    '"stoplight" fulfills "inexpensive"',
    edgeInexpensiveLight,
  );
  const nodeInexpensiveLightWeek = await createNode(
    "critique",
    "one week of construction costs",
    edgeInexpensiveLight,
  );
  const edgeInexpensiveLightWeek = await createEdge(
    nodeInexpensiveLightWeek,
    "critiques",
    nodeInexpensiveLightRootClaim,
  );

  // user scores
  const createScore = async (graphPart: Node | Edge, value: number) => {
    return await xprisma.userScore.create({
      data: {
        username: testUser.username,
        graphPartId: graphPart.id,
        topicId: graphPart.topicId,
        value: value,
      },
    });
  };

  const scoreFast = await createScore(nodeCarsGoingTooFast, 9);
  const scoreFastRootClaim = await createScore(nodeCarsGoingTooFastRootClaim, 9);
  const scoreInexpensive = await createScore(nodeInexpensive, 8);
  const scoreConveys = await createScore(nodeConveysReasoning, 6);
  const scoreSlow = await createScore(nodeGetsCarsToSlow, 9);
  const scoreStoplight = await createScore(nodeStoplight, 6);
  const scoreStopSign = await createScore(nodeStopSign, 7);
  const scoreSpeedBump = await createScore(nodeSpeedBump, 2);
  const scoreSpeedBumpRootClaim = await createScore(nodeSpeedBumpRootClaim, 2);
  const scorePlaySign = await createScore(nodeKidsAtPlaySign, 6);
  const scoreInexpensiveLight = await createScore(edgeInexpensiveLight, 3);
  const scoreInexpensiveLightRootClaim = await createScore(nodeInexpensiveLightRootClaim, 3);
  const scoreInexpensiveSign = await createScore(edgeInexpensiveSign, 7);
  const scoreInexpensiveBump = await createScore(edgeInexpensiveBump, 8);
  const scoreInexpensivePlay = await createScore(edgeInexpensivePlay, 7);
  const scoreConveysPlay = await createScore(edgeConveysPlay, 9);
  const scoreSlowLight = await createScore(edgeSlowLight, 9);
  const scoreSlowSign = await createScore(edgeSlowSign, 9);
  const scoreSlowBump = await createScore(edgeSlowBump, 9);
  const scoreSlowPlay = await createScore(edgeSlowPlay, 6);
};

// not sure how to use top-level await without messing with project config
seed()
  .then(() => console.log("done running seed script"))
  .catch((error: unknown) => console.log("issues running seed script, error: \n", error))
  .finally(() => void xprisma.$disconnect());
