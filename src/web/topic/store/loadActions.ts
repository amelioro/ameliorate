import { claimRelationNames } from "../../../common/edge";
import { errorWithData } from "../../../common/errorHandling";
import { emitter } from "../../common/event";
import {
  type TopicData,
  convertToStoreEdge,
  convertToStoreNode,
  convertToStoreScores,
} from "../utils/apiConversion";
import { Diagram, layoutVisibleComponents, topicDiagramId } from "../utils/diagram";
import { claimNodeTypes } from "../utils/node";
import { initialState, topicStorePlaygroundName, useTopicStore } from "./store";
import { getTopicDiagram } from "./utils";

export const populateFromApi = async (topicData: TopicData) => {
  // Ensure we use distinct persistence for topic page compared to playground.
  // Persisting saved-to-db topics allows us to use upload/download with persist migrations.
  useTopicStore.persist.setOptions({ name: "diagram-storage-saved-to-db" });

  const topicDiagramNodes = topicData.nodes.filter((node) => !claimNodeTypes.includes(node.type));
  const topicDiagramEdges = topicData.edges.filter(
    (edge) => !claimRelationNames.includes(edge.type)
  );
  const topicDiagram: Diagram = {
    id: topicDiagramId,
    nodes: topicDiagramNodes.map((node) => convertToStoreNode(node, topicDiagramId)),
    edges: topicDiagramEdges.map((edge) => convertToStoreEdge(edge, topicDiagramId)),
    type: "problem",
  };

  const claimTrees: Diagram[] = topicData.nodes
    .filter((node) => node.type === "rootClaim")
    .map((rootClaim) => {
      if (!rootClaim.arguedDiagramPartId)
        throw errorWithData("root claim does not have root argued set", rootClaim);
      const diagramId = rootClaim.arguedDiagramPartId;

      return {
        id: diagramId,

        nodes: topicData.nodes
          .filter((node) => node.arguedDiagramPartId === diagramId)
          .map((node) => convertToStoreNode(node, diagramId)),

        edges: topicData.edges
          .filter((edge) => edge.arguedDiagramPartId === diagramId)
          .map((edge) => convertToStoreEdge(edge, diagramId)),

        type: "claim",
      };
    });

  const layoutedTopicDiagram = await layoutVisibleComponents(topicDiagram, claimTrees);

  const layoutedClaimTrees: [string, Diagram][] = await Promise.all(
    claimTrees.map(async (diagram) => [diagram.id, await layoutVisibleComponents(diagram, [])])
  );

  const userScores = convertToStoreScores(topicData.userScores);

  useTopicStore.setState(
    {
      topic: {
        id: topicData.id,
        title: topicData.title,
        creatorName: topicData.creatorName,
      },
      diagrams: {
        [topicDiagramId]: layoutedTopicDiagram,
        ...Object.fromEntries(layoutedClaimTrees),
      },
      userScores,
      activeTableProblemId: null,
      activeClaimTreeId: null,
    },
    false,
    "populateFromApi"
  );

  emitter.emit("loadedTopicData", layoutedTopicDiagram);

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

  emitter.emit("loadedTopicData", getTopicDiagram(useTopicStore.getState()));

  // it doesn't make sense to want to undo a page load
  useTopicStore.temporal.getState().clear();
};
