import { initialState, topicStorePlaygroundName, useTopicStore } from "@/web/topic/store/store";
import {
  type TopicData,
  convertToStoreEdge,
  convertToStoreNode,
  convertToStoreScores,
} from "@/web/topic/utils/apiConversion";

export const populateDiagramFromApi = (topicData: TopicData) => {
  // Ensure we use distinct persistence for topic page compared to playground.
  // Persisting saved-to-db topics allows us to use upload/download with persist migrations.
  useTopicStore.persist.setOptions({ name: "diagram-storage-saved-to-db" });

  const topicGraphNodes = topicData.nodes.map((node) => convertToStoreNode(node));
  const topicGraphEdges = topicData.edges.map((edge) => convertToStoreEdge(edge));

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
    },
    true,
    "populateFromApi",
  );

  // it doesn't make sense to want to undo a page load
  useTopicStore.temporal.getState().clear();
};

export const populateDiagramFromLocalStorage = async () => {
  // Ensure we use distinct persistence for topic page compared to playground.
  useTopicStore.persist.setOptions({ name: topicStorePlaygroundName });

  if (useTopicStore.persist.getOptions().storage?.getItem(topicStorePlaygroundName)) {
    // TODO(bug): for some reason, this results in an empty undo action _after_ clear() is run - despite awaiting this promise
    await useTopicStore.persist.rehydrate();
  } else {
    useTopicStore.setState(initialState, true, "populateFromLocalStorage");
  }

  // it doesn't make sense to want to undo a page load
  useTopicStore.temporal.getState().clear();
};
