import { inferRouterOutputs } from "@trpc/server";
import compact from "lodash/compact";

import { AppRouter } from "../../../api/routers/_app";
import { Edge as ApiEdge, Edge } from "../../../common/edge";
import { Node as ApiNode, Node } from "../../../common/node";
import { UserScore as ApiUserScore, UserScore } from "../../../common/userScore";
import { TopicStoreState } from "../store/store";
import {
  Score,
  Edge as StoreEdge,
  Node as StoreNode,
  buildEdge,
  buildNode,
  problemDiagramId,
} from "./diagram";

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

export const convertToApiNode = (storeNode: StoreNode, topicId: number): ApiNode => {
  return {
    id: storeNode.id,
    topicId: topicId,
    arguedDiagramPartId:
      storeNode.data.diagramId !== problemDiagramId ? storeNode.data.diagramId : null,
    type: storeNode.type,
    text: storeNode.data.label,
  };
};

export const convertToApiEdge = (storeEdge: StoreEdge, topicId: number): ApiEdge => {
  return {
    id: storeEdge.id,
    topicId: topicId,
    arguedDiagramPartId:
      storeEdge.data.diagramId !== problemDiagramId ? storeEdge.data.diagramId : null,
    type: storeEdge.label,
    sourceId: storeEdge.source,
    targetId: storeEdge.target,
  };
};

export const convertToApiUserScore = (
  graphPart: StoreNode | StoreEdge,
  userId: number,
  topicId: number
): ApiUserScore | null => {
  if (graphPart.data.score === "-") return null; // don't save a user score for empty scores

  return {
    userId: userId,
    graphPartId: graphPart.id,
    topicId: topicId,
    value: parseInt(graphPart.data.score),
  };
};

interface ApiData {
  nodes: Node[];
  edges: Edge[];
  userScores: UserScore[];
}

export const convertToApi = (topicStore: TopicStoreState): ApiData => {
  if (!topicStore.topic) throw new Error("must create topic before saving topic data");
  const topicId = topicStore.topic.id;
  const userId = topicStore.topic.creatorId; // when scores per user are added, we'll probably just have a `userScores` Record<> in the store

  const nodes = Object.values(topicStore.diagrams).flatMap((diagram) =>
    diagram.nodes.map((node) => convertToApiNode(node, topicId))
  );

  const edges = Object.values(topicStore.diagrams).flatMap((diagram) =>
    diagram.edges.map((edge) => convertToApiEdge(edge, topicId))
  );

  const userScores = Object.values(topicStore.diagrams).flatMap((diagram) => {
    const scores = [...diagram.nodes, ...diagram.edges].map((graphPart) =>
      convertToApiUserScore(graphPart, userId, topicId)
    );
    return compact(scores);
  });

  return { nodes, edges, userScores };
};
