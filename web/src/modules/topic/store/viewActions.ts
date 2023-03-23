import { getClaimDiagramId, getImplicitLabel } from "../utils/claim";
import {
  ArguableType,
  buildNode,
  findArguable,
  findNode,
  layoutVisibleComponents,
} from "../utils/diagram";
import { children } from "../utils/node";
import { doesDiagramExist } from "./actions";
import { problemDiagramId, useTopicStore } from "./store";
import { getActiveDiagram } from "./utils";

export const viewOrCreateClaimDiagram = (arguableId: string, arguableType: ArguableType) => {
  useTopicStore.setState(
    (state) => {
      const diagramId = getClaimDiagramId(arguableId, arguableType);

      // create claim diagram if it doesn't exist
      if (!doesDiagramExist(diagramId)) {
        const activeDiagram = getActiveDiagram(state);
        const arguable = findArguable(activeDiagram, arguableId, arguableType);
        const label = getImplicitLabel(arguableId, arguableType, activeDiagram);

        /* eslint-disable functional/immutable-data, no-param-reassign */
        const newNode = buildNode({
          id: `${state.nextNodeId++}`,
          label: label,
          score: arguable.data.score,
          type: "rootClaim",
          diagramId: diagramId,
        });

        state.diagrams[diagramId] = {
          id: diagramId,
          nodes: [newNode],
          edges: [],
          type: "claim",
        };
        /* eslint-enable functional/immutable-data, no-param-reassign */
      }

      /* eslint-disable functional/immutable-data, no-param-reassign */
      state.activeClaimDiagramId = diagramId;
      /* eslint-enable functional/immutable-data, no-param-reassign */
    },
    false,
    "viewOrCreateClaimDiagram"
  );
};

export const viewClaimDiagram = (diagramId: string) => {
  useTopicStore.setState(
    (state) => {
      /* eslint-disable functional/immutable-data, no-param-reassign */
      state.activeClaimDiagramId = diagramId;
      /* eslint-enable functional/immutable-data, no-param-reassign */
    },
    false,
    "viewClaimDiagram"
  );
};

export const closeClaimDiagram = () => {
  useTopicStore.setState(
    (state) => {
      /* eslint-disable functional/immutable-data, no-param-reassign */
      state.activeClaimDiagramId = null;
      /* eslint-enable functional/immutable-data, no-param-reassign */
    },
    false,
    "closeClaimDiagram"
  );
};

export const closeTable = () => {
  useTopicStore.setState(
    (state) => {
      /* eslint-disable functional/immutable-data, no-param-reassign */
      state.activeTableProblemId = null;
      /* eslint-enable functional/immutable-data, no-param-reassign */
    },
    false,
    "closeTable"
  );
};

export const toggleShowCriteria = (problemNodeId: string, show: boolean) => {
  useTopicStore.setState(
    (state) => {
      const problemDiagram = state.diagrams[problemDiagramId]; // criteria nodes only live in problem diagram

      const node = findNode(problemDiagram, problemNodeId);
      if (node.type !== "problem") throw new Error("node is not a problem");

      const criteria = children(node, problemDiagram).filter((child) => child.type === "criterion");

      /* eslint-disable functional/immutable-data, no-param-reassign */
      criteria.forEach((criterion) => (criterion.data.showing = show));
      /* eslint-enable functional/immutable-data, no-param-reassign */

      const layoutedDiagram = layoutVisibleComponents(problemDiagram); // depends on showCriteria having been updated

      /* eslint-disable functional/immutable-data, no-param-reassign */
      problemDiagram.nodes = layoutedDiagram.nodes;
      problemDiagram.edges = layoutedDiagram.edges;
      /* eslint-enable functional/immutable-data, no-param-reassign */
    },
    false,
    "toggleShowCriteria"
  );
};

export const viewProblemDiagram = () => {
  useTopicStore.setState(
    (state) => {
      /* eslint-disable functional/immutable-data, no-param-reassign */
      state.activeTableProblemId = null;
      state.activeClaimDiagramId = null;
      /* eslint-enable functional/immutable-data, no-param-reassign */
    },
    false,
    "viewProblemDiagram"
  );
};

export const viewCriteriaTable = (problemNodeId: string) => {
  useTopicStore.setState(
    (state) => {
      /* eslint-disable functional/immutable-data, no-param-reassign */
      state.activeTableProblemId = problemNodeId;
      state.activeClaimDiagramId = null;
      /* eslint-enable functional/immutable-data, no-param-reassign */
    },
    false,
    "viewCriteriaTable"
  );
};
