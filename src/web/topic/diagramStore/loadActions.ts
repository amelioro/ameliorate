import {
  diagramStorePlaygroundName,
  initialState,
  useDiagramStore,
} from "@/web/topic/diagramStore/store";
import {
  type TopicData,
  convertToStoreEdge,
  convertToStoreNode,
  convertToStoreScores,
} from "@/web/topic/utils/apiConversion";

export const populateDiagramFromApi = (topicData: TopicData) => {
  // Ensure we use distinct persistence for topic page compared to playground.
  // Persisting saved-to-db topics allows us to use upload/download with persist migrations.
  useDiagramStore.persist.setOptions({ name: "diagram-storage-saved-to-db" });

  useDiagramStore.apiSyncer.pause();

  const topicGraphNodes = topicData.nodes.map((node) => convertToStoreNode(node));
  const topicGraphEdges = topicData.edges.map((edge) => convertToStoreEdge(edge));

  const userScores = convertToStoreScores(topicData.userScores);

  useDiagramStore.setState(
    {
      nodes: topicGraphNodes,
      edges: topicGraphEdges,
      userScores,
    },
    true,
    "populateFromApi",
  );

  useDiagramStore.apiSyncer.resume();

  // it doesn't make sense to want to undo a page load
  useDiagramStore.temporal.getState().clear();
};

export const populateDiagramFromLocalStorage = async () => {
  // Ensure we use distinct persistence for topic page compared to playground.
  useDiagramStore.persist.setOptions({ name: diagramStorePlaygroundName });

  useDiagramStore.apiSyncer.pause();

  if (useDiagramStore.persist.getOptions().storage?.getItem(diagramStorePlaygroundName)) {
    // TODO(bug): for some reason, this results in an empty undo action _after_ clear() is run - despite awaiting this promise
    await useDiagramStore.persist.rehydrate();
  } else {
    useDiagramStore.setState(initialState, true, "populateFromLocalStorage");
  }

  useDiagramStore.apiSyncer.resume();

  // it doesn't make sense to want to undo a page load
  useDiagramStore.temporal.getState().clear();
};
