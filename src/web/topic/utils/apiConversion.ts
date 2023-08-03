import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "../../../api/routers/_app";
import { Score, buildEdge, buildNode } from "./diagram";

// TODO: passing topicData here is really bad, but userScores will be separated from StoreEdge soon
export const convertToStoreNode = (apiNode: TopicNode, diagramId: string, topicData: TopicData) => {
  const score: Score | undefined = topicData.userScores
    .find((score) => score.userId === topicData.creatorId && score.graphPartId === apiNode.id)
    ?.value.toString() as Score | undefined;

  return buildNode({
    id: apiNode.id,
    label: apiNode.text,
    score: score,
    type: apiNode.type,
    diagramId: diagramId,
  });
};

// TODO: passing topicData here is really bad, but userScores will be separated from StoreEdge soon
export const convertToStoreEdge = (apiEdge: TopicEdge, diagramId: string, topicData: TopicData) => {
  const score: Score | undefined = topicData.userScores
    .find((score) => score.userId === topicData.creatorId && score.graphPartId === apiEdge.id)
    ?.value.toString() as Score | undefined;

  return buildEdge(apiEdge.id, apiEdge.sourceId, apiEdge.targetId, apiEdge.type, diagramId, score);
};

export type TopicData = NonNullable<inferRouterOutputs<AppRouter>["topic"]["getData"]>;
export type TopicNode = TopicData["nodes"][number];
export type TopicEdge = TopicData["edges"][number];
