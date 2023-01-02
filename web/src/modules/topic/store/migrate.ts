/* eslint-disable -- don't really care to make this file meet eslint standards */
import { range } from "lodash";

export const migrate = (persistedState: any, version: number) => {
  const migrations = [migrate_0_to_1];

  let state = persistedState;

  // thanks for this style to migrate one version at a time https://github.com/pmndrs/zustand/issues/984#issuecomment-1144661466
  range(version + 1).forEach((i) => {
    state = migrations[i](state);
  });

  return state;
};

const migrate_0_to_1 = (state: any) => {
  const relations = [
    { Parent: "Problem", Child: "Problem", name: "causes" },
    { Parent: "Problem", Child: "Solution", name: "solves" },

    { Parent: "Solution", Child: "Problem", name: "created by" },

    { Parent: "RootClaim", Child: "Support", name: "supports" },
    { Parent: "RootClaim", Child: "Critique", name: "critiques" },

    { Parent: "Support", Child: "Support", name: "supports" },
    { Parent: "Support", Child: "Critique", name: "critiques" },

    { Parent: "Critique", Child: "Support", name: "supports" },
    { Parent: "Critique", Child: "Critique", name: "critiques" },
  ];

  Object.values(state.diagrams).forEach((diagram: any) => {
    diagram.edges.forEach((edge: any) => {
      // add edge markers
      // didn't make a separate migration for this - change causing this is https://github.com/keyserj/ameliorate/commit/2434103524718234cf9246bafedab89603c49aae
      edge.markerStart = { type: "arrowclosed", width: 30, height: 30 };

      // add edge labels
      const sourceNodeType = diagram.nodes.find((node: any) => node.id === edge.source)?.type;
      const targetNodeType = diagram.nodes.find((node: any) => node.id === edge.target)?.type;
      const relation = relations.find(
        (relation) => relation.Parent === sourceNodeType && relation.Child === targetNodeType
      );
      edge.label = relation?.name;
    });

    // replace diagram direction with type
    diagram.type = diagram.direction === "TB" ? "Problem" : "Claim";
    delete diagram.direction;
  });

  return state;
};
