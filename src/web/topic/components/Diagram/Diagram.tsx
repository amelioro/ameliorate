import { ComponentType, useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  Background,
  BackgroundVariant,
  type EdgeProps as DefaultEdgeProps,
  type NodeProps as DefaultNodeProps,
  OnEdgeUpdateFunc,
  ReactFlowProvider,
  useReactFlow,
  useStore,
} from "reactflow";

import { Loading } from "@/web/common/components/Loading/Loading";
import { emitter } from "@/web/common/event";
import { useSessionUser } from "@/web/common/hooks";
import { openContextMenu } from "@/web/common/store/contextMenuActions";
import { clearPartIdToCentralize, usePartIdToCentralize } from "@/web/common/store/ephemeralStore";
import { StyledReactFlow } from "@/web/topic/components/Diagram/Diagram.styles";
import { setDisplayNodesGetter } from "@/web/topic/components/Diagram/externalFlowStore";
import { FlowEdge } from "@/web/topic/components/Edge/FlowEdge";
import { FlowNode } from "@/web/topic/components/Node/FlowNode";
import { connectNodes, reconnectEdge } from "@/web/topic/diagramStore/createDeleteActions";
import { useDiagram } from "@/web/topic/diagramStore/store";
import { useLayoutedDiagram } from "@/web/topic/hooks/diagramHooks";
import { PanDirection, panDirections, useViewportUpdater } from "@/web/topic/hooks/flowHooks";
import { useUserCanEditTopicData } from "@/web/topic/topicStore/store";
import { Diagram as DiagramData, PositionedEdge, PositionedNode } from "@/web/topic/utils/diagram";
import { hotkeys } from "@/web/topic/utils/hotkeys";
import { FlowNodeType } from "@/web/topic/utils/node";
import { tutorialIsOpen } from "@/web/tutorial/tutorial";
import { useFlashlightMode } from "@/web/view/actionConfigStore";
import { setSelected } from "@/web/view/selectedPartStore";

const buildNodeComponent = (type: FlowNodeType) => {
  // eslint-disable-next-line react/display-name -- react flow dynamically creates these components without name anyway
  return (props: NodeProps) => {
    return <FlowNode {...props} type={type} />;
  };
};

// this can be generated via `nodeDecorations` but hard to do without the complexity making it hard to follow, so leaving this hardcoded
const nodeTypes: Record<FlowNodeType, ComponentType<NodeProps>> = {
  // topic
  problem: buildNodeComponent("problem"),
  cause: buildNodeComponent("cause"),
  solution: buildNodeComponent("solution"),
  solutionComponent: buildNodeComponent("solutionComponent"),
  criterion: buildNodeComponent("criterion"),
  effect: buildNodeComponent("effect"),
  benefit: buildNodeComponent("benefit"),
  detriment: buildNodeComponent("detriment"),
  obstacle: buildNodeComponent("obstacle"),
  mitigation: buildNodeComponent("mitigation"),
  mitigationComponent: buildNodeComponent("mitigationComponent"),

  // research
  question: buildNodeComponent("question"),
  answer: buildNodeComponent("answer"),
  fact: buildNodeComponent("fact"),
  source: buildNodeComponent("source"),

  // justification
  rootClaim: buildNodeComponent("rootClaim"),
  support: buildNodeComponent("support"),
  critique: buildNodeComponent("critique"),

  // generic
  custom: buildNodeComponent("custom"),
};

const edgeTypes: Record<"FlowEdge", ComponentType<EdgeProps>> = { FlowEdge: FlowEdge };

// react-flow passes exactly DefaultNodeProps but data can be customized
// not sure why, but DefaultNodeProps has xPos and yPos instead of Node's position.x and position.y
export interface NodeProps extends DefaultNodeProps {
  data: PositionedNode["data"];
}

export interface EdgeProps extends DefaultEdgeProps {
  // we'll always pass data - why does react-flow make it nullable :(
  // can't figure out how to amend this to make it non-nullable, since react-flow's Edge is defined as a type, not an interface
  data?: PositionedEdge["data"];
}

const onEdgeUpdate: OnEdgeUpdateFunc = (oldEdge, newConnection) => {
  reconnectEdge(oldEdge, newConnection.source, newConnection.target);
};

const DiagramWithoutProvider = (diagram: DiagramData) => {
  const [topicViewUpdated, setTopicViewUpdated] = useState(false);
  const [newNodeId, setNewNodeId] = useState<string | null>(null);

  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);
  const { fitViewForNodes, moveViewportToIncludeNode, pan, zoomIn, zoomOut } = useViewportUpdater();
  const { viewportInitialized } = useReactFlow();
  const { layoutedDiagram, hasNewLayout, setHasNewLayout } = useLayoutedDiagram(diagram);
  const getNodes = useStore((state) => state.getNodes);

  const flashlightMode = useFlashlightMode();
  const partIdToCentralize = usePartIdToCentralize();

  useHotkeys(hotkeys.zoomIn, (e) => {
    e.preventDefault(); // don't use browser's zoom
    zoomIn();
  });
  useHotkeys(hotkeys.zoomOut, (e) => {
    e.preventDefault(); // don't use browser's zoom
    zoomOut();
  });
  useHotkeys(hotkeys.pan, (_e, hotkeyEvent) => {
    if (!hotkeyEvent.keys) return;
    const [direction] = hotkeyEvent.keys;
    if (!direction || !panDirections.some((d) => direction === d)) return;
    if (tutorialIsOpen()) return; // prevent moving between tour steps and panning at the same time. ideally maybe move tour if that's focused, pan otherwise? not sure
    pan(direction as PanDirection);
  });

  useEffect(() => {
    const unbindAdd = emitter.on("addNode", (node) => setNewNodeId(node.id));
    const unbindLoad = emitter.on("overwroteDiagramData", () => setTopicViewUpdated(true));
    const unbindFilter = emitter.on("changedDiagramFilter", () => setTopicViewUpdated(true));
    const unbindLayoutConfig = emitter.on("changedLayoutConfig", () => setTopicViewUpdated(true));

    return () => {
      unbindAdd();
      unbindLoad();
      unbindFilter();
      unbindLayoutConfig();
    };
  }, []);

  useEffect(() => {
    setDisplayNodesGetter(getNodes);
  }, [getNodes]);

  // centralize part via `useEffect` because `viewBasics` event can directly cause `TopicPane` re-render, which throws a React error if it happens during the `Diagram` render
  useEffect(() => {
    if (!partIdToCentralize || !layoutedDiagram || !viewportInitialized) return;

    const nodeToCentralize = layoutedDiagram.nodes.find((node) => node.id === partIdToCentralize);
    const edgeToCentralize = layoutedDiagram.edges.find((edge) => edge.id === partIdToCentralize);
    const partIsDisplayed = nodeToCentralize ?? edgeToCentralize;

    // apparently timeout is needed to actually move the viewport? not sure why, since we know viewport is already initialized
    if (nodeToCentralize) setTimeout(() => fitViewForNodes([nodeToCentralize], true), 0);
    else if (!partIsDisplayed) emitter.emit("viewBasics");

    clearPartIdToCentralize();
  }, [fitViewForNodes, layoutedDiagram, partIdToCentralize, viewportInitialized]);

  if (!layoutedDiagram) return <Loading />;

  const { nodes, edges } = layoutedDiagram;

  if (newNodeId && hasNewLayout) {
    const newNode = nodes.find((node) => node.id === newNodeId);
    if (newNode) moveViewportToIncludeNode(newNode);
    setNewNodeId(null);
  }

  if (topicViewUpdated && hasNewLayout) {
    fitViewForNodes(nodes);
    setTopicViewUpdated(false);
  }

  if (hasNewLayout) setHasNewLayout(false);

  return (
    <>
      <StyledReactFlow
        className={
          // annoying way of just relying on css to put the react-flow__panel in the bottom-right for big screens, upper-right for small screens
          // so that it's opposite of the quick view select, which is sometimes overlayed and can otherwise overlap with the react-flow__panel
          String.raw`[&_.react-flow\_\_panel]:top-0 [&_.react-flow\_\_panel]:bottom-auto lg:[&_.react-flow\_\_panel]:bottom-0 lg:[&_.react-flow\_\_panel]:top-auto` +
          (flashlightMode ? " flashlight-mode" : "")
        }
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ maxZoom: 1 }}
        minZoom={0} // is annoying if you can't see the whole diagram... not sure of downsides to allowing further zooming out; maybe you could lose where the diagram is if it's too small? but that doesn't seem like a big deal, since diagram autofits on filter change
        nodesFocusable={false}
        onConnect={
          userCanEditTopicData ? ({ source, target }) => connectNodes(source, target) : undefined
        }
        onContextMenu={(event) => openContextMenu(event, {})}
        onEdgeUpdate={userCanEditTopicData ? onEdgeUpdate : undefined}
        nodesDraggable={false}
        nodesConnectable={userCanEditTopicData}
        onPaneClick={() => setSelected(null)}
        deleteKeyCode={null} // was preventing holding ctrl and repeating backspace to delete multiple words from node text
        elevateEdgesOnSelect={true} // this puts selected edges (or neighbor-to-selected-node edges) in a separate svg that is given a higher zindex, so they can be elevated above other nodes
        zoomOnDoubleClick={false} // idk it seems annoying when accidentally double clicking
      >
        <Background variant={BackgroundVariant.Dots} />
      </StyledReactFlow>
    </>
  );
};

export const Diagram = () => {
  const diagram = useDiagram();

  return (
    // wrap in provider so we can use react-flow state https://reactflow.dev/docs/api/react-flow-provider/
    <ReactFlowProvider>
      <DiagramWithoutProvider {...diagram} />
    </ReactFlowProvider>
  );
};
