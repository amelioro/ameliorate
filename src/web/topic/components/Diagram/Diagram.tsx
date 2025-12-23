import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  type EdgeProps as DefaultEdgeProps,
  type NodeProps as DefaultNodeProps,
  OnReconnect as OnReconnectFunc,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import { ComponentType, useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { Loading } from "@/web/common/components/Loading/Loading";
import { emitter } from "@/web/common/event";
import { useSessionUser } from "@/web/common/hooks";
import { openContextMenu } from "@/web/common/store/contextMenuActions";
import { clearPartIdToCentralize, usePartIdToCentralize } from "@/web/common/store/ephemeralStore";
import { StyledReactFlow } from "@/web/topic/components/Diagram/Diagram.styles";
import { setFlowMethods } from "@/web/topic/components/Diagram/externalFlowStore";
import { FlowEdge } from "@/web/topic/components/Edge/FlowEdge";
import { FlowNode } from "@/web/topic/components/Node/FlowNode";
import { connectNodes, reconnectEdge } from "@/web/topic/diagramStore/createDeleteActions";
import { useDiagram } from "@/web/topic/diagramStore/store";
import { usePositionedDiagram } from "@/web/topic/hooks/diagramHooks";
import { PanDirection, panDirections, useViewportUpdater } from "@/web/topic/hooks/flowHooks";
import { useUserCanEditTopicData } from "@/web/topic/topicStore/store";
import { Diagram as DiagramData, PositionedEdge, PositionedNode } from "@/web/topic/utils/diagram";
import { Edge } from "@/web/topic/utils/graph";
import { hotkeys } from "@/web/topic/utils/hotkeys";
import { FlowNodeType } from "@/web/topic/utils/node";
import { tutorialIsOpen } from "@/web/tutorial/tutorial";
import { useFlashlightMode } from "@/web/view/actionConfigStore";
import { setSelected, useSelectedGraphPart } from "@/web/view/selectedPartStore";

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
  data: PositionedEdge["data"];
  type: Edge["type"]; // for some reason after reactflow 11->12, DefaultEdgeProps has optional type, but ReactFlow component expects it to be defined
}

const onReconnect: OnReconnectFunc = (oldEdge, newConnection) => {
  reconnectEdge(oldEdge, newConnection.source, newConnection.target);
};

const DiagramWithoutProvider = (diagram: DiagramData) => {
  const [topicViewUpdated, setTopicViewUpdated] = useState(false);
  const [newNodeId, setNewNodeId] = useState<string | null>(null);

  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);
  const { fitViewForNodes, moveViewportToIncludeNode, pan, zoomIn, zoomOut } = useViewportUpdater();
  const { viewportInitialized, getNodes, getNodesBounds } = useReactFlow();
  const { positionedDiagram, hasNewLayout, setHasNewLayout } = usePositionedDiagram(diagram);

  const selectedGraphPart = useSelectedGraphPart();
  const flashlightMode = useFlashlightMode();
  const partIdToCentralize = usePartIdToCentralize();

  useHotkeys(hotkeys.zoomIn, (e) => {
    e.preventDefault(); // don't use browser's zoom
    void zoomIn();
  });
  useHotkeys(hotkeys.zoomOut, (e) => {
    e.preventDefault(); // don't use browser's zoom
    void zoomOut();
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
    setFlowMethods(getNodes, getNodesBounds);
  }, [getNodes, getNodesBounds]);

  // centralize part via `useEffect` because `viewBasics` event can directly cause `TopicPane` re-render, which throws a React error if it happens during the `Diagram` render
  useEffect(() => {
    if (!partIdToCentralize || !positionedDiagram || !viewportInitialized) return;

    const nodeToCentralize = positionedDiagram.nodes.find((node) => node.id === partIdToCentralize);
    const edgeToCentralize = positionedDiagram.edges.find((edge) => edge.id === partIdToCentralize);
    const partIsDisplayed = nodeToCentralize ?? edgeToCentralize;

    if (nodeToCentralize) fitViewForNodes([nodeToCentralize], true);
    else if (!partIsDisplayed) emitter.emit("viewBasics");

    clearPartIdToCentralize();
  }, [fitViewForNodes, positionedDiagram, partIdToCentralize, viewportInitialized]);

  if (!positionedDiagram) return <Loading />;

  const { nodes, edges } = positionedDiagram;

  if (newNodeId && hasNewLayout) {
    const newNode = nodes.find((node) => node.id === newNodeId);
    if (newNode) moveViewportToIncludeNode(newNode);
    setNewNodeId(null);
  }

  if (topicViewUpdated && hasNewLayout) {
    fitViewForNodes(nodes, true);
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
          (flashlightMode ? " flashlight-mode" : "") +
          /**
           * Somewhat janky way to blur not-selected/not-neighboring nodes, edge labels, and edge
           * paths when a node or edge is selected.
           *
           * `blur-xs` (4px) might not be enough contrast, `blur-sm` (8px) might be too much because blurred
           * edge lines aren't easily found, so `blur-[5px]` seems like an ok middleground.
           *
           * Notes:
           * - `has(.spotlight-primary)` is used so that blur only applies when a part currently
           * being spotlighted (rather than based on node selection, which if the selected node was
           * deleted, would blur all parts without focusing any)
           * - `not(:has(.react-flow__connectionline))` so that nodes aren't blurred when trying to
           * create an edge to one
           * - `not(:hover)` so that hovering unblurs a node/edge, so that you know what you're clicking,
           * and that a blurred node doesn't appear in front of an unblurred node (not doing this on
           * the path itself because unblurring just the path doesn't seem useful).
           *
           * - Performance: with a very rough test of selecting a node and counting how many
           * frames of a video it takes before the selection is rendered (with 58 nodes showing),
           * without this code, it takes 7-9 frames; with this code it takes 7-8 frames (each frame is ~66ms).
           * So it seems like the performance isn't significantly impacted by this.
           *
           * - TODO(bug?): for some reason, path/label blurring doesn't animate when a node is already
           * selected and you select another node; I think this might be because the current react-flow
           * version _moves_ edges in the DOM based on whether or not they're selected. The latest
           * version of react-flow doesn't seem to do this, so upgrading might fix.
           */
          String.raw` [&:has(.spotlight-primary):not(:has(.react-flow\_\_connectionline))_.react-flow\_\_node:has(.spotlight-normal):not(:hover)]:blur-[5px]` +
          String.raw` [&:has(.spotlight-primary)_.diagram-edge.spotlight-normal:not(:hover)]:blur-[5px]` +
          String.raw` [&:has(.spotlight-primary)_.react-flow\_\_edge-path.spotlight-normal]:blur-[5px]` +
          String.raw` [&_.react-flow\_\_node]:transition-[filter] [&_.react-flow\_\_node]:duration-300` +
          String.raw` [&_.diagram-edge]:transition-[filter] [&_.diagram-edge]:duration-300` +
          String.raw` [&_.react-flow\_\_edge-path]:transition-[filter] [&_.react-flow\_\_edge-path]:duration-300`
        }
        // add selected here because react flow uses it (as opposed to our custom components, which can rely on selectedGraphPart hook independently)
        // may need to memoize if performance is an issue? since this will create a different array every Diagram render
        nodes={nodes.map((node) => ({ ...node, selected: node.id === selectedGraphPart?.id }))}
        edges={edges.map((edge) => ({ ...edge, selected: edge.id === selectedGraphPart?.id }))}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ maxZoom: 1 }}
        minZoom={0} // is annoying if you can't see the whole diagram... not sure of downsides to allowing further zooming out; maybe you could lose where the diagram is if it's too small? but that doesn't seem like a big deal, since diagram autofits on filter change
        nodesFocusable={false}
        onConnect={
          userCanEditTopicData
            ? ({ source, target }) => connectNodes(source, undefined, target)
            : undefined
        }
        onContextMenu={(event) => openContextMenu(event, {})}
        connectionMode={ConnectionMode.Loose}
        onReconnect={userCanEditTopicData ? onReconnect : undefined}
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
