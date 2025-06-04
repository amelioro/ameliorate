import { inferRouterOutputs } from "@trpc/server";
import compact from "lodash/compact";
import set from "lodash/set";

import { AppRouter } from "@/api/routers/_app";
import { Edge as ApiEdge, Edge } from "@/common/edge";
import { Node as ApiNode, Node } from "@/common/node";
import { UserScore as ApiScore } from "@/common/userScore";
import { UserScores as StoreScores, TopicStoreState } from "@/web/topic/diagramStore/store";
import { isPlaygroundTopic } from "@/web/topic/diagramStore/utils";
import {
  Score,
  Edge as StoreEdge,
  Node as StoreNode,
  buildEdge,
  buildNode,
} from "@/web/topic/utils/graph";

export const convertToStoreNode = (apiNode: TopicNode) => {
  return buildNode({
    id: apiNode.id,
    label: apiNode.text,
    notes: apiNode.notes,
    type: apiNode.type,
    arguedDiagramPartId: apiNode.arguedDiagramPartId ?? undefined,
    customType: apiNode.customType ?? undefined,
  });
};

export const convertToStoreEdge = (apiEdge: TopicEdge) => {
  return buildEdge({
    id: apiEdge.id,
    notes: apiEdge.notes,
    sourceId: apiEdge.sourceId,
    targetId: apiEdge.targetId,
    relation: apiEdge.type,
    arguedDiagramPartId: apiEdge.arguedDiagramPartId ?? undefined,
    customLabel: apiEdge.customLabel ?? undefined,
  });
};

export const convertToStoreScores = (apiUserScores: TopicUserScores): StoreScores => {
  const storeScores: StoreScores = {};

  apiUserScores.forEach((apiScore) => {
    const score: Score = apiScore.value.toString() as Score;

    // mutation seems much easier than not mutating
    set(storeScores, [apiScore.username, apiScore.graphPartId], score);
  });

  return storeScores;
};

export type TopicData = NonNullable<inferRouterOutputs<AppRouter>["topic"]["getData"]>;
export type TopicNode = TopicData["nodes"][number];
export type TopicEdge = TopicData["edges"][number];
export type TopicUserScores = TopicData["userScores"];

export const convertToApiNode = (storeNode: StoreNode, topicId: number): ApiNode => {
  return {
    id: storeNode.id,
    topicId: topicId,
    arguedDiagramPartId: storeNode.data.arguedDiagramPartId ?? null,
    type: storeNode.type,
    customType: storeNode.data.customType,
    text: storeNode.data.label,
    notes: storeNode.data.notes,
  };
};

export const convertToApiEdge = (storeEdge: StoreEdge, topicId: number): ApiEdge => {
  return {
    id: storeEdge.id,
    topicId: topicId,
    arguedDiagramPartId: storeEdge.data.arguedDiagramPartId ?? null,
    type: storeEdge.label,
    customLabel: storeEdge.data.customLabel,
    notes: storeEdge.data.notes,
    sourceId: storeEdge.source,
    targetId: storeEdge.target,
  };
};

export const convertToApiUserScores = (storeScores: StoreScores, topicId: number): ApiScore[] => {
  const apiUserScores = Object.entries(storeScores).flatMap(([username, scoresByGraphPart]) => {
    return Object.entries(scoresByGraphPart).flatMap(([graphPartId, score]) => {
      if (score === "-") return null; // don't save a user score for empty scores

      return {
        username,
        graphPartId,
        topicId,
        value: parseInt(score),
      };
    });
  });

  return compact(apiUserScores);
};

interface ApiData {
  nodes: Node[];
  edges: Edge[];
  userScores: ApiScore[];
}

export const convertToApi = (topicStore: TopicStoreState): ApiData => {
  if (isPlaygroundTopic(topicStore.topic))
    throw new Error("must create topic before saving topic data");
  const topicId = topicStore.topic.id;

  const nodes = topicStore.nodes.map((node) => convertToApiNode(node, topicId));
  const edges = topicStore.edges.map((edge) => convertToApiEdge(edge, topicId));
  const userScores = convertToApiUserScores(topicStore.userScores, topicId);

  return { nodes, edges, userScores };
};
