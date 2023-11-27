import { Typography } from "@mui/material";
import isEmpty from "lodash/isEmpty";
import { ComponentType, createContext, useEffect, useState } from "react";
import {
  Background,
  BackgroundVariant,
  type EdgeProps as DefaultEdgeProps,
  type NodeProps as DefaultNodeProps,
  type EdgeChange,
  type EdgeSelectionChange,
  type NodeChange,
  type NodeSelectionChange,
  ReactFlowProvider,
} from "reactflow";

import { emitter } from "../../../common/event";
import { useSessionUser } from "../../../common/hooks";
import { useViewportUpdater } from "../../hooks/flowHooks";
import { setSelected } from "../../store/actions";
import { connectNodes, reconnectEdge } from "../../store/createDeleteActions";
import { useUserCanEditTopicData } from "../../store/userHooks";
import { Diagram as DiagramData, type Edge, type Node } from "../../utils/diagram";
import { Orientation } from "../../utils/layout";
import { FlowNodeType } from "../../utils/node";
import { FlowEdge } from "../Edge/FlowEdge";
import { FlowNode } from "../Node/FlowNode";
import { StyledReactFlow } from "./Diagram.styles";

const buildNodeComponent = (type: FlowNodeType) => {
  // eslint-disable-next-line react/display-name -- react flow dynamically creates these components without name anyway
  return (props: NodeProps) => {
    return <FlowNode {...props} type={type} />;
  };
};

// this can be generated via `nodeDecorations` but hard to do without the complexity making it hard to follow, so leaving this hardcoded
const nodeTypes: Record<FlowNodeType, ComponentType<NodeProps>> = {
  problem: buildNodeComponent("problem"),
  solution: buildNodeComponent("solution"),
  solutionComponent: buildNodeComponent("solutionComponent"),
  criterion: buildNodeComponent("criterion"),
  effect: buildNodeComponent("effect"),
  rootClaim: buildNodeComponent("rootClaim"),
  support: buildNodeComponent("support"),
  critique: buildNodeComponent("critique"),
};

const edgeTypes: Record<"FlowEdge", ComponentType<EdgeProps>> = { FlowEdge: FlowEdge };

// react-flow passes exactly DefaultNodeProps but data can be customized
// not sure why, but DefaultNodeProps has xPos and yPos instead of Node's position.x and position.y
export interface NodeProps extends DefaultNodeProps {
  data: Node["data"];
}

export interface EdgeProps extends DefaultEdgeProps {
  // we'll always pass data - why does react-flow make it nullable :(
  // can't figure out how to amend this to make it non-nullable, since react-flow's Edge is defined as a type, not an interface
  data?: Edge["data"];
}

const onGraphPartChange = (changes: (NodeChange | EdgeChange)[]) => {
  const selectChanges = changes.filter((change) => change.type === "select") as
    | NodeSelectionChange[]
    | EdgeSelectionChange[];

  if (selectChanges.length > 0) setSelected(selectChanges);
};

const DiagramWithoutProvider = ({ nodes, edges, type }: DiagramData) => {
  const [topicNewlyLoaded, setTopicNewlyLoaded] = useState(false);

  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);
  const { fitViewForNodes, moveViewportToIncludeNode } = useViewportUpdater();

  useEffect(() => {
    const unbindAdd = emitter.on("addNode", (node) => {
      if (!nodes.map((node) => node.id).includes(node.id)) return;
      moveViewportToIncludeNode(node);
    });
    const unbindLoad = emitter.on("loadedTopicData", () => setTopicNewlyLoaded(true));

    return () => {
      unbindAdd();
      unbindLoad();
    };
  }, [nodes, fitViewForNodes, moveViewportToIncludeNode]);

  if (topicNewlyLoaded) {
    // TODO(bug): diagram flickers with newly-loaded nodes before fitting to view
    fitViewForNodes(nodes);
    setTopicNewlyLoaded(false);
  }

  const emptyText = <Typography variant="h5">Right-click to create</Typography>;

  return (
    <>
      <StyledReactFlow
        id={type} // need unique ids to use multiple flow instances on the same page
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ maxZoom: 1 }}
        minZoom={0.25}
        onConnect={
          userCanEditTopicData
            ? ({ source, target }) => void connectNodes(source, target)
            : undefined
        }
        onContextMenu={(e) => e.preventDefault()}
        onEdgesChange={(changes) => onGraphPartChange(changes)}
        onNodesChange={(changes) => onGraphPartChange(changes)}
        onEdgeUpdate={
          userCanEditTopicData
            ? (oldEdge, newConnection) =>
                void reconnectEdge(oldEdge, newConnection.source, newConnection.target)
            : undefined
        }
        nodesDraggable={false}
        nodesConnectable={userCanEditTopicData}
        deleteKeyCode={null} // was preventing holding ctrl and repeating backspace to delete multiple words from node text
        elevateEdgesOnSelect={true} // this puts selected edges (or neighbor-to-selected-node edges) in a separate svg that is given a higher zindex, so they can be elevated above other nodes
      >
        <Background variant={BackgroundVariant.Dots} />
        {isEmpty(nodes) && emptyText}
      </StyledReactFlow>
    </>
  );
};

export const DiagramContext = createContext<{ orientation: Orientation }>({ orientation: "DOWN" });

export const Diagram = (diagram: DiagramData) => (
  // custom provider so that nodes can get the orientation based on the diagram they're in
  <DiagramContext.Provider value={{ orientation: diagram.orientation }}>
    {/* wrap in provider so we can use react-flow state https://reactflow.dev/docs/api/react-flow-provider/ */}
    <ReactFlowProvider>
      <DiagramWithoutProvider {...diagram} />
    </ReactFlowProvider>
  </DiagramContext.Provider>
);
