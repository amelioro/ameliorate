/* eslint-disable -- don't really care to make this file meet eslint standards, since store type is changing between each migration */

import set from "lodash/set";
import camelCase from "lodash/camelCase";
import { v4 as uuid } from "uuid";
import { updateTopicWithoutSyncingToApi } from "@/web/topic/topicStore/store";

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
    migrate_11_to_12,
    migrate_12_to_13,
    migrate_13_to_14,
    migrate_14_to_15,
    migrate_15_to_16,
    migrate_16_to_17,
    migrate_17_to_18,
    migrate_18_to_19,
    migrate_19_to_20,
    migrate_20_to_21,
    migrate_21_to_22,
    migrate_22_to_23,
    migrate_23_to_24,
    migrate_24_to_25,
  ];

  let state = persistedState;

  // thanks for this style to migrate one version at a time https://github.com/pmndrs/zustand/issues/984#issuecomment-1144661466
  migrations.forEach((migration, i) => {
    if (i >= version) {
      state = migration(state);
    }
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
        (relation) => relation.Parent === sourceNodeType && relation.Child === targetNodeType,
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
      node.type = camelCase(node.type);
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

const migrate_11_to_12 = (state: any) => {
  Object.values(state.diagrams).forEach((diagram: any) => {
    diagram.edges.forEach((edge: any) => {
      // rename edge labels to use camelCase instead of space case
      if (edge.label === "created by") {
        edge.label = "createdBy";
      } else if (edge.label === "criterion for") {
        edge.label = "criterionFor";
      }
    });
  });

  return state;
};

// use uuids for node & edge ids instead of incrementing numbers
const migrate_12_to_13 = (state: any) => {
  const diagramIdChanges: any[][] = [];

  // why does migration of 1k nodes & edges take several seconds?
  Object.values(state.diagrams).forEach((diagram: any) => {
    diagram.nodes.forEach((nodeWithChangingId: any) => {
      const oldId = nodeWithChangingId.id;
      const oldDiagramId = `node-${oldId}`;
      const newId = uuid();
      nodeWithChangingId.id = newId;

      diagram.edges.forEach((edge: any) => {
        if (edge.source === oldId) edge.source = newId;
        if (edge.target === oldId) edge.target = newId;
      });

      diagramIdChanges.push([oldId, oldDiagramId, newId]);
    });

    diagram.edges.forEach((edgeWithChangingId: any) => {
      const oldId = edgeWithChangingId.id;
      const oldDiagramId = `edge-${oldId}`;
      const newId = uuid();
      edgeWithChangingId.id = newId;

      diagramIdChanges.push([oldId, oldDiagramId, newId]);
    });
  });

  diagramIdChanges.forEach(([oldId, oldDiagramId, newId]) => {
    if (Object.keys(state.diagrams).includes(oldDiagramId)) {
      const diagram = state.diagrams[oldDiagramId];

      diagram.nodes.forEach((node: any) => {
        node.data.diagramId = newId;
      });

      diagram.edges.forEach((edge: any) => {
        edge.data.diagramId = newId;
      });

      state.diagrams[newId] = state.diagrams[oldDiagramId];
      state.diagrams[newId].id = newId;
      delete state.diagrams[oldDiagramId];
    }

    if (oldId === state.activeTableProblemId) state.activeTableProblemId = newId;
    if (oldId === state.activeClaimDiagramId) state.activeClaimDiagramId = newId;
  });

  // clean up claim trees for edges that were deleted - there was a bug (now fixed) where deleting a diagram edge would not delete these
  Object.keys(state.diagrams).forEach((diagramId) => {
    if (
      diagramId !== "root" &&
      !diagramIdChanges.map(([_, __, newId]) => newId).includes(diagramId)
    ) {
      if (!diagramId.startsWith("edge-")) throw new Error("orphaned claim tree for node?");
      delete state.diagrams[diagramId];
    }
  });

  delete state.nextNodeId;
  delete state.nextEdgeId;

  return state;
};

const migrate_13_to_14 = (state: any) => {
  Object.values(state.diagrams).forEach((diagram: any) => {
    // rename activeClaimDiagramId -> activeClaimTreeId
    state.activeClaimTreeId = state.activeClaimDiagramId;
    delete state.activeClaimDiagramId;
  });

  return state;
};
/* eslint-enable */

/* eslint-disable functional/immutable-data, no-param-reassign -- ok we can at least try to meet non-mutation standards by pasting in types */

interface GraphPart14 {
  id: string;
  data: { score?: string }; // optional because being removed
}
interface Diagram14 {
  nodes: GraphPart14[];
  edges: GraphPart14[];
}
type UserScores = Record<string, Record<string, string>>; // userScores[:username][:graphPartId]
interface State14 {
  diagrams: Record<string, Diagram14>;
  userScores: UserScores; // new
}

// move scores from node/edge to userScores
const migrate_14_to_15 = (state: State14) => {
  // we only care to migrate playground data, so any scores will be under the user "me."
  state.userScores = {};

  Object.values(state.diagrams).forEach((diagram) => {
    diagram.nodes.forEach((node) => {
      if (node.data.score !== "-") set(state.userScores, ["me.", node.id], node.data.score);
      delete node.data.score;
    });

    diagram.edges.forEach((edge) => {
      if (edge.data.score !== "-") set(state.userScores, ["me.", edge.id], edge.data.score);
      delete edge.data.score;
    });
  });

  return state;
};

interface State15 {
  topic: {
    id: number;
    title: string;
    creatorName: string;
  } | null;
}

interface State16 {
  topic:
    | {
        id: number;
        title: string;
        description: string;
        creatorName: string;
      }
    | {
        id: undefined;
        title: string;
        description: string;
      };
}

const migrate_15_to_16 = (state: State15) => {
  if (state.topic) {
    (state as State16).topic.description = "";
  } else {
    (state as State16).topic = {
      id: undefined,
      title: "",
      description: "",
    };
  }

  return state;
};

interface FromDiagram16 {
  edges: { type: "ScoreEdge" }[];
}

interface FromState16 {
  diagrams: Record<string, FromDiagram16>;
}

interface ToEdge17 {
  type: "FlowEdge";
}

const migrate_16_to_17 = (state: FromState16) => {
  Object.values(state.diagrams).forEach((diagram) => {
    diagram.edges.forEach((edge) => {
      (edge as unknown as ToEdge17).type = "FlowEdge";
    });
  });

  return state;
};

interface Diagram17 {
  nodes: { data: { diagramId?: string } }[];
  edges: { data: { diagramId?: string } }[];
}

interface FromState17 {
  diagrams?: Record<string, Diagram17>;
}

interface GraphPart18 {
  data: { arguedDiagramPartId?: string };
}

interface ToState18 {
  nodes: GraphPart18[];
  edges: GraphPart18[];
}

const migrate_17_to_18 = (state: FromState17) => {
  // - set graphPart.data.arguedDiagramPartId
  // - delete graphPart.data.diagramId
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  Object.values(state.diagrams!).forEach((diagram) => {
    [...diagram.nodes, ...diagram.edges].forEach((graphPart) => {
      const diagramId = graphPart.data.diagramId;
      if (diagramId !== "root") {
        (graphPart as GraphPart18).data.arguedDiagramPartId = diagramId;
      }

      delete graphPart.data.diagramId;
    });
  });

  // - create nodes and edges from topic diagram and each claim tree into single list of nodes and edges
  // - delete diagrams
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  (state as unknown as ToState18).nodes = Object.values(state.diagrams!).flatMap(
    (diagram) => diagram.nodes as GraphPart18[],
  );
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  (state as unknown as ToState18).edges = Object.values(state.diagrams!).flatMap(
    (diagram) => diagram.edges as GraphPart18[],
  );
  delete state.diagrams;

  return state;
};

interface FromState18 {
  nodes: { position?: { x: number; y: number } }[];
}

const migrate_18_to_19 = (state: FromState18) => {
  // position is moved from store to diagram component
  state.nodes.forEach((node) => {
    delete node.position;
  });

  return state;
};

interface FromState19 {
  nodes: { selected?: boolean }[];
  edges: { selected?: boolean }[];
  activeTableProblemId?: string | null;
  activeClaimTreeId?: string | null;
}

const migrate_19_to_20 = (state: FromState19) => {
  state.nodes.forEach((node) => delete node.selected);
  state.edges.forEach((edge) => delete edge.selected);
  delete state.activeTableProblemId;
  delete state.activeClaimTreeId;

  return state;
};

interface FromState20 {
  showImpliedEdges?: boolean;
}

const migrate_20_to_21 = (state: FromState20) => {
  delete state.showImpliedEdges;
  return state;
};

interface FromState21 {
  nodes: Record<string, never>[];
  edges: Record<string, never>[];
}

interface Node22 {
  data: {
    notes: string;
  };
}

interface Edge22 {
  data: {
    notes: string;
  };
}

// don't remember when notes was added, but we never defaulted it via migration, and we rely on notes.length,
// so we're migrating it now
const migrate_21_to_22 = (state: FromState21) => {
  state.nodes.forEach((node) => ((node as unknown as Node22).data.notes = ""));
  state.edges.forEach((edge) => ((edge as unknown as Edge22).data.notes = ""));

  return state;
};

interface FromState22 {
  userScores: Record<string, Record<string, string>>; // userScores[:username][:graphPartId]
}

const migrate_22_to_23 = (state: FromState22) => {
  // use "playground.user" instead of "me." on the playground
  if (state.userScores["me."]) {
    state.userScores["playground.user"] = state.userScores["me."];
    delete state.userScores["me."];
  }

  return state;
};

interface FromState23 {
  edges: {
    label: string;
  }[];
}

const migrate_23_to_24 = (state: FromState23) => {
  state.edges.forEach((edge) => {
    if (edge.label === "embodies") {
      edge.label = "fulfills";
    }
  });

  return state;
};

interface FromState24 {
  topic?:
    | {
        id: undefined;
        description: string;
      }
    | {
        id: number;
        title: string;
        creatorName: string;
        description: string;
        visibility: "private" | "public" | "unlisted";
        allowAnyoneToEdit: boolean;
        createdAt: Date;
        updatedAt: Date;
      };
  nodes: { data: { customType?: string | null } }[];
  edges: { data: { customLabel?: string | null } }[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ToState25 {
  nodes: { data: { customType?: string | null } }[];
  edges: { data: { customLabel?: string | null } }[];
}

// remove topic state from this store; put it into topic store if we're on the playground (mainly to preserve description)
const migrate_24_to_25 = (state: FromState24) => {
  const topic = state.topic;

  delete state.topic;

  if (topic && topic.id === undefined) {
    updateTopicWithoutSyncingToApi(topic);
  }

  // Also add `customType: null` to all nodes' data if it's not there yet, since we never migrated to add that, and zod validation requires it to exist.
  // Same for `customLabel` on edges.
  // Should've done it around version 21 of the store https://github.com/amelioro/ameliorate/commit/9ef55fd5fa241eb74c576b5b759b43398bc9090c.
  state.nodes.forEach((node) => {
    if (node.data.customType === undefined) {
      node.data.customType = null;
    }
  });
  state.edges.forEach((edge) => {
    if (edge.data.customLabel === undefined) {
      edge.data.customLabel = null;
    }
  });

  return state as ToState25;
};
