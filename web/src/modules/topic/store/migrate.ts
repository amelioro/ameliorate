/* eslint-disable -- don't really care to make this file meet eslint standards */
import _ from "lodash";
import { range } from "lodash";

export const migrate = (persistedState: any, version: number) => {
  const migrations = [
    migrate_0_to_1,
    migrate_1_to_2,
    migrate_2_to_3,
    migrate_3_to_4,
    migrate_4_to_5,
    migrate_5_to_6,
    migrate_6_to_7,
    migrate_7_to_8,
    migrate_8_to_9,
    migrate_9_to_10,
    migrate_10_to_11,
  ];

  let state = persistedState;

  // thanks for this style to migrate one version at a time https://github.com/pmndrs/zustand/issues/984#issuecomment-1144661466
  range(version, migrations.length).forEach((i) => {
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
      // didn't make a separate migration for this - change causing this is https://github.com/amelioro/ameliorate/commit/2434103524718234cf9246bafedab89603c49aae
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

const migrate_1_to_2 = (state: any) => {
  Object.values(state.diagrams).forEach((diagram: any) => {
    diagram.nodes.forEach((node: any) => {
      // change type to lowercase
      node.type = _.camelCase(node.type);
    });
  });

  return state;
};

const migrate_2_to_3 = (state: any) => {
  Object.values(state.diagrams).forEach((diagram: any) => {
    diagram.nodes.forEach((node: any) => {
      // add showCriteria: true to each problem
      if (node.type === "problem") {
        node.data.showCriteria = true;
      }
    });
  });

  return state;
};

const migrate_3_to_4 = (state: any) => {
  // activeDiagramId -> activeClaimDiagramId, activeTableProblemId
  state.activeClaimDiagramId = null;
  state.activeTableProblemId = null;
  delete state.activeDiagramId;

  Object.entries(state.diagrams).map(([diagramId, diagram]: [any, any]) => {
    // set diagram id
    diagram.id = diagramId;

    // "Problem"->"problem" and "Claim"->"claim"
    diagram.type = diagram.type.toLowerCase();

    diagram.nodes.forEach((node: any) => {
      // width removed from store (replaced with hardcoded value)
      delete node.data.width;
    });
  });

  return state;
};

const migrate_4_to_5 = (state: any) => {
  Object.values(state.diagrams).forEach((diagram: any) => {
    diagram.edges.forEach((edge: any) => {
      // set diagramId on edges
      edge.data.diagramId = diagram.id;
    });
  });

  return state;
};

const migrate_5_to_6 = (state: any) => {
  Object.values(state.diagrams).forEach((diagram: any) => {
    // replace score of 10 with score of 9
    diagram.nodes
      .filter((node: any) => node.data.score === "10")
      .forEach((node: any) => {
        node.data.score = "9";
      });

    diagram.edges
      .filter((edge: any) => edge.data.score === "10")
      .forEach((edge: any) => {
        edge.data.score = "9";
      });
  });

  return state;
};

const migrate_6_to_7 = (state: any) => {
  Object.values(state.diagrams).forEach((diagram: any) => {
    // replace problem.showCriteria with node.showing
    diagram.nodes.forEach((node: any) => {
      node.data.showing = true;

      if (node.type === "problem") {
        delete node.data.showCriteria;
      }
    });
  });

  return state;
};

const migrate_7_to_8 = (state: any) => {
  Object.values(state.diagrams).forEach((diagram: any) => {
    // add edge.showing
    diagram.edges.forEach((edge: any) => {
      edge.data.showing = true;
    });
  });

  return state;
};

const migrate_8_to_9 = (state: any) => {
  Object.values(state.diagrams).forEach((diagram: any) => {
    diagram.edges.forEach((edge: any) => {
      // remove edge.showing
      delete edge.data.showing;
    });
  });

  return state;
};

const migrate_9_to_10 = (state: any) => {
  state.showImpliedEdges = true;
  return state;
};

const migrate_10_to_11 = (state: any) => {
  Object.values(state.diagrams).forEach((diagram: any) => {
    diagram.edges.forEach((edge: any) => {
      // rename edge "solves" -> "addresses"
      if (edge.label === "solves") {
        edge.label = "addresses";
      }
    });
  });

  return state;
};
