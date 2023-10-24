import { inferRouterOutputs } from "@trpc/server";
import compact from "lodash/compact";
import set from "lodash/set";

import { AppRouter } from "../../../api/routers/_app";
import { Edge as ApiEdge, Edge } from "../../../common/edge";
import { Node as ApiNode, Node } from "../../../common/node";
import { UserScore as ApiScore } from "../../../common/userScore";
import { UserScores as StoreScores, TopicStoreState } from "../store/store";
import { isPlaygroundTopic } from "../store/utils";
import {
  Score,
  Edge as StoreEdge,
  Node as StoreNode,
  buildEdge,
  buildNode,
  topicDiagramId,
} from "./diagram";

export const convertToStoreNode = (apiNode: TopicNode, diagramId: string) => {
  return buildNode({
    id: apiNode.id,
    label: apiNode.text,
    type: apiNode.type,
    diagramId: diagramId,
  });
};

export const convertToStoreEdge = (apiEdge: TopicEdge, diagramId: string) => {
  return buildEdge({
    id: apiEdge.id,
    sourceNodeId: apiEdge.sourceId,
    targetNodeId: apiEdge.targetId,
    relation: apiEdge.type,
    diagramId,
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
    arguedDiagramPartId:
      storeNode.data.diagramId !== topicDiagramId ? storeNode.data.diagramId : null,
    type: storeNode.type,
    text: storeNode.data.label,
  };
};

export const convertToApiEdge = (storeEdge: StoreEdge, topicId: number): ApiEdge => {
  return {
    id: storeEdge.id,
    topicId: topicId,
    arguedDiagramPartId:
      storeEdge.data.diagramId !== topicDiagramId ? storeEdge.data.diagramId : null,
    type: storeEdge.label,
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

  const nodes = Object.values(topicStore.diagrams).flatMap((diagram) =>
    diagram.nodes.map((node) => convertToApiNode(node, topicId))
  );

  const edges = Object.values(topicStore.diagrams).flatMap((diagram) =>
    diagram.edges.map((edge) => convertToApiEdge(edge, topicId))
  );

  const userScores = convertToApiUserScores(topicStore.userScores, topicId);

  return { nodes, edges, userScores };
};
