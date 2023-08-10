import { claimRelationNames } from "../../../common/edge";
import { errorWithData } from "../../../common/errorHandling";
import { type TopicData, convertToStoreEdge, convertToStoreNode } from "../utils/apiConversion";
import { Diagram, layoutVisibleComponents, problemDiagramId } from "../utils/diagram";
import { claimNodeTypes } from "../utils/node";
import { useTopicStore } from "./store";

export const populateFromApi = async (topicData: TopicData) => {
  const problemDiagramNodes = topicData.nodes.filter((node) => !claimNodeTypes.includes(node.type));
  const problemDiagramEdges = topicData.edges.filter(
    (edge) => !claimRelationNames.includes(edge.type)
  );
  const problemDiagram: Diagram = {
    id: problemDiagramId,
    nodes: problemDiagramNodes.map((node) => convertToStoreNode(node, problemDiagramId, topicData)),
    edges: problemDiagramEdges.map((edge) => convertToStoreEdge(edge, problemDiagramId, topicData)),
    type: "problem",
  };

  const claimDiagrams: Diagram[] = topicData.nodes
    .filter((node) => node.type === "rootClaim")
    .map((rootClaim) => {
      if (!rootClaim.arguedDiagramPartId)
        throw errorWithData("root claim does not have root argued set", rootClaim);
      const diagramId = rootClaim.arguedDiagramPartId;

      return {
        id: diagramId,

        nodes: topicData.nodes
          .filter((node) => node.arguedDiagramPartId === diagramId)
          .map((node) => convertToStoreNode(node, diagramId, topicData)),

        edges: topicData.edges
          .filter((edge) => edge.arguedDiagramPartId === diagramId)
          .map((edge) => convertToStoreEdge(edge, diagramId, topicData)),

        type: "claim",
      };
    });

  const layoutedClaimDiagrams: [string, Diagram][] = await Promise.all(
    claimDiagrams.map(async (diagram) => [diagram.id, await layoutVisibleComponents(diagram, [])])
  );

  useTopicStore.setState(
    {
      topic: {
        id: topicData.id,
        title: topicData.title,
        creatorId: topicData.creatorId,
      },
      diagrams: {
        [problemDiagramId]: await layoutVisibleComponents(problemDiagram, claimDiagrams),
        ...Object.fromEntries(layoutedClaimDiagrams),
      },
      activeTableProblemId: null,
      activeClaimDiagramId: null,
    },
    false,
    "populateFromApi"
  );

  // it doesn't make sense to want to undo a page load
  useTopicStore.temporal.getState().clear();
};

export const populateFromLocalStorage = async () => {
  // TODO(bug): for some reason, this results in an empty undo action _after_ clear() is run - despite awaiting this promise
  await useTopicStore.persist.rehydrate();

  // it doesn't make sense to want to undo a page load
  useTopicStore.temporal.getState().clear();
};
