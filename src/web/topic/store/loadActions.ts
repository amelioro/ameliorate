import { claimRelationNames } from "../../../common/edge";
import { emitter } from "../../common/event";
import {
  type TopicData,
  convertToStoreEdge,
  convertToStoreNode,
  convertToStoreScores,
} from "../utils/apiConversion";
import { Diagram, layoutVisibleComponents } from "../utils/diagram";
import { claimNodeTypes } from "../utils/node";
import { initialState, topicStorePlaygroundName, useTopicStore } from "./store";

export const populateFromApi = async (topicData: TopicData) => {
  // Ensure we use distinct persistence for topic page compared to playground.
  // Persisting saved-to-db topics allows us to use upload/download with persist migrations.
  useTopicStore.persist.setOptions({ name: "diagram-storage-saved-to-db" });

  const topicGraphNodes = topicData.nodes.map((node) => convertToStoreNode(node));
  const topicGraphEdges = topicData.edges.map((edge) => convertToStoreEdge(edge));

  const topicDiagram: Diagram = {
    nodes: topicGraphNodes.filter((node) => !claimNodeTypes.includes(node.type)),
    edges: topicGraphEdges.filter((edge) => !claimRelationNames.includes(edge.label)),
    orientation: "DOWN",
    type: "topicDiagram",
  };

  // TODO(bug): lay out claim trees in Claim Tree component
  const claimEdges = topicData.edges
    .filter((edge) => claimRelationNames.includes(edge.type))
    .map((edge) => convertToStoreEdge(edge));
  await layoutVisibleComponents(topicDiagram, claimEdges);

  const userScores = convertToStoreScores(topicData.userScores);

  useTopicStore.setState(
    {
      topic: {
        id: topicData.id,
        title: topicData.title,
        creatorName: topicData.creatorName,
        description: topicData.description,
      },
      nodes: topicGraphNodes,
      edges: topicGraphEdges,
      userScores,
      activeTableProblemId: null,
      activeClaimTreeId: null,
    },
    false,
    "populateFromApi"
  );

  emitter.emit("loadedTopicData");

  // it doesn't make sense to want to undo a page load
  useTopicStore.temporal.getState().clear();
};

export const populateFromLocalStorage = async () => {
  // Ensure we use distinct persistence for topic page compared to playground.
  useTopicStore.persist.setOptions({ name: topicStorePlaygroundName });

  if (useTopicStore.persist.getOptions().storage?.getItem(topicStorePlaygroundName)) {
    // TODO(bug): for some reason, this results in an empty undo action _after_ clear() is run - despite awaiting this promise
    await useTopicStore.persist.rehydrate();
  } else {
    useTopicStore.setState(initialState, true, "populateFromLocalStorage");
  }

  emitter.emit("loadedTopicData");

  // it doesn't make sense to want to undo a page load
  useTopicStore.temporal.getState().clear();
};
