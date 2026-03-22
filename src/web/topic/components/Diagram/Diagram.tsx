import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  OnReconnect as OnReconnectFunc,
  ReactFlowProvider,
  useOnViewportChange,
  useReactFlow,
  useStoreApi,
} from "@xyflow/react";
import { ComponentType, useCallback, useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { throwError } from "@/common/errorHandling";
import { Loading } from "@/web/common/components/Loading/Loading";
import { emitter } from "@/web/common/event";
import { useDeepMemo, useSessionUser } from "@/web/common/hooks";
import { openContextMenu } from "@/web/common/store/contextMenuActions";
import { clearPartIdToCentralize, usePartIdToCentralize } from "@/web/common/store/ephemeralStore";
import { StyledReactFlow } from "@/web/topic/components/Diagram/Diagram.styles";
import { setFlowMethods } from "@/web/topic/components/Diagram/externalFlowStore";
import { setViewportIsChanging } from "@/web/topic/components/Diagram/viewportChangeStore";
import { FlowDirectEdge } from "@/web/topic/components/Edge/FlowDirectEdge";
import { FlowIndirectEdge } from "@/web/topic/components/Edge/FlowIndirectEdge";
import { FlowNode } from "@/web/topic/components/Node/FlowNode";
import { connectNodes, reconnectEdge } from "@/web/topic/diagramStore/createDeleteActions";
import { useFilteredDiagram } from "@/web/topic/diagramStore/filteredDiagramStore";
import { useLayoutedDiagram } from "@/web/topic/hooks/diagramHooks";
import { PanDirection, panDirections, useViewportUpdater } from "@/web/topic/hooks/flowHooks";
import { useUserCanEditTopicData } from "@/web/topic/topicStore/store";
import {
  FlowEdgeProps,
  FlowNodeProps,
  ReactFlowEdge,
  ReactFlowNode,
} from "@/web/topic/utils/flowUtils";
import { hotkeys } from "@/web/topic/utils/hotkeys";
import { isIndirectEdgeId } from "@/web/topic/utils/indirectEdges";
import { LayoutedEdge, LayoutedNode, parsePortId } from "@/web/topic/utils/layout";
import { tutorialIsOpen } from "@/web/tutorial/tutorial";
import { useFlashlightMode } from "@/web/view/actionConfigStore";
import { setSelected, useSelectedGraphPart } from "@/web/view/selectedPartStore";

const nodeTypes: Record<"FlowNode", ComponentType<FlowNodeProps>> = { FlowNode: FlowNode };
const edgeTypes: Record<"FlowDirectEdge" | "FlowIndirectEdge", ComponentType<FlowEdgeProps>> = {
  FlowDirectEdge: FlowDirectEdge,
  FlowIndirectEdge: FlowIndirectEdge,
};

const convertToReactFlowNodes = (
  layoutedNodes: LayoutedNode[],
  nodeLookup: Map<string, { measured: { width?: number; height?: number } }>,
  selectedGraphPartId?: string,
): ReactFlowNode[] => {
  return layoutedNodes.map((node) => ({
    id: node.id,
    /**
     * This is awkward to overwrite our own node types (e.g. problem/benefits/etc.), but react flow
     * doesn't need to know about these types - its types are used for mapping to react components,
     * and all of our node types use the same FlowNode component.
     * In the future we may use different components, but they very likely wouldn't be 1-1 with our
     * types - e.g. for FlowEdge we might use an IndirectEdge type.
     */
    type: "FlowNode" as const,
    position: { x: node.x, y: node.y },
    data: { ports: node.ports },
    selected: node.id === selectedGraphPartId,
    /**
     * Without carrying forward React Flow's `measured`, React Flow thinks nodes are "uninitialized"
     * and destroys connected edge SVGs until re-measurement completes (causing edge remounts).
     */
    measured: nodeLookup.get(node.id)?.measured,
  }));
};

/**
 * Build a map from edge id to its parallel offset index, so that multiple edges between the same
 * two nodes can be visually spread apart.
 *
 * Indexes are symmetric around 0: e.g. 2 edges: [-1, 1]; 3 edges: [-1, 0, 1]; 4 edges: [-2, -1, 1, 2].
 * Index is undefined when there's only 1 edge between the two nodes.
 */
const getParallelOffsetsByEdgeId = (layoutedEdges: LayoutedEdge[]) => {
  const edgesByNodePair: Record<string, LayoutedEdge[]> = {};
  layoutedEdges.forEach((edge) => {
    const nodeA = parsePortId(edge.sourcePortId).nodeId;
    const nodeB = parsePortId(edge.targetPortId).nodeId;
    // use sorted IDs so A→B and B→A share a group
    const pairKey = nodeA < nodeB ? `${nodeA}..${nodeB}` : `${nodeB}..${nodeA}`;
    // eslint-disable-next-line functional/immutable-data
    (edgesByNodePair[pairKey] ??= []).push(edge);
  });

  const offsetsByEdgeId: Record<string, number | undefined> = {};
  Object.values(edgesByNodePair).forEach((group) => {
    if (group.length === 1) {
      const edgeId = group[0]?.id ?? throwError("expected edge in group", group);
      // eslint-disable-next-line functional/immutable-data
      offsetsByEdgeId[edgeId] = undefined;
      return;
    }

    const count = group.length;
    const isEven = count % 2 === 0;
    group.forEach((edge, i) => {
      // For odd count: -floor(count/2) ... 0 ... +floor(count/2)
      // For even count: skip 0, e.g. -2, -1, 1, 2
      const rawIndex = i - Math.floor(count / 2);
      const offsetIndex = isEven && rawIndex >= 0 ? rawIndex + 1 : rawIndex;
      // eslint-disable-next-line functional/immutable-data
      offsetsByEdgeId[edge.id] = offsetIndex;
    });
  });

  return offsetsByEdgeId;
};

const convertToReactFlowEdges = (
  layoutedEdges: LayoutedEdge[],
  selectedGraphPartId: string | undefined,
): ReactFlowEdge[] => {
  const parallelOffsetByEdgeId = getParallelOffsetsByEdgeId(layoutedEdges);

  return layoutedEdges.map((edge) => ({
    id: edge.id,
    // layouted edges don't have source/target nodes because they use ports directly... could add them but it seems not worth
    source: parsePortId(edge.sourcePortId).nodeId,
    target: parsePortId(edge.targetPortId).nodeId,
    /**
     * This is awkward to overwrite our own edge types (e.g. causes/has/etc.), but react flow
     * doesn't need to know about these types - its types are used for mapping to react components.
     */
    type: isIndirectEdgeId(edge.id) ? "FlowIndirectEdge" : "FlowDirectEdge",
    sourceHandle: edge.sourcePortId,
    targetHandle: edge.targetPortId,
    data: {
      sourcePoint: edge.sourcePoint,
      targetPoint: edge.targetPoint,
      bendPoints: edge.bendPoints,
      labelPosition: edge.labelPosition,
      parallelOffsetIndex: parallelOffsetByEdgeId[edge.id],
    },
    selected: edge.id === selectedGraphPartId,
  }));
};

const onReconnect: OnReconnectFunc = (oldEdge, newConnection) => {
  reconnectEdge(oldEdge, newConnection.source, newConnection.target);
};

const DiagramWithoutProvider = () => {
  const [topicViewUpdated, setTopicViewUpdated] = useState(false);
  const [newNodeId, setNewNodeId] = useState<string | null>(null);

  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);
  const { fitViewForNodes, moveViewportToIncludeNode, pan, zoomIn, zoomOut } = useViewportUpdater();
  const { viewportInitialized, getNodes, getNodesBounds } = useReactFlow();
  const nodeLookup = useStoreApi().getState().nodeLookup; // so we can pass react flow's `node.measured` back into react flow, see `convertToReactFlowNodes` comment

  useOnViewportChange({
    onStart: useCallback(() => setViewportIsChanging(true), []),
    onEnd: useCallback(() => setViewportIsChanging(false), []),
  });

  const filteredDiagram = useFilteredDiagram();
  const { layoutedDiagram, hasNewLayout, setHasNewLayout } = useLayoutedDiagram(filteredDiagram);

  const selectedGraphPartId = useSelectedGraphPart()?.id;
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

  const { layoutedNodes, layoutedEdges } = layoutedDiagram ?? {
    layoutedNodes: [] as LayoutedNode[],
    layoutedEdges: [] as LayoutedEdge[],
  };

  /**
   * Generally React Flow should only need layout information, and our own node/edge components can
   * get other part data that they need for rendering.
   *
   * Initial motivation for separating these is that we want our node/edge components to re-render
   * based on all latest node/edge data, but the React Flow component should only have to re-render
   * if layout stuff changes.
   *
   * Future motivation is that we want our graphing logic to be able to use a minimal node/edge data
   * structure that isn't affected by frontend-specific preferences (e.g. React Flow's `data` field).
   *
   * Note: may need to memoize if performance is an issue? I think React Flow wraps our node/edge
   * components in a memoized component though, so may not be an issue.
   */
  const reactFlowNodes = useDeepMemo(
    convertToReactFlowNodes(layoutedNodes, nodeLookup, selectedGraphPartId),
  );
  const reactFlowEdges = useDeepMemo(convertToReactFlowEdges(layoutedEdges, selectedGraphPartId));

  if (!layoutedDiagram) return <Loading />;

  if (newNodeId && hasNewLayout) {
    const newNode = reactFlowNodes.find((node) => node.id === newNodeId);
    if (newNode) moveViewportToIncludeNode(newNode);
    setNewNodeId(null);
  }

  if (topicViewUpdated && hasNewLayout) {
    fitViewForNodes(reactFlowNodes, true);
    setTopicViewUpdated(false);
  }

  if (hasNewLayout) setHasNewLayout(false);

  if (partIdToCentralize && viewportInitialized) {
    const nodeToCentralize = reactFlowNodes.find((node) => node.id === partIdToCentralize);
    const edgeToCentralize = reactFlowEdges.find((edge) => edge.id === partIdToCentralize);
    const partIsDisplayed = nodeToCentralize ?? edgeToCentralize;

    if (nodeToCentralize) fitViewForNodes([nodeToCentralize], true);
    // timeout to make event async because it can directly cause `TopicPane` re-render, which throws a React error if it happens during the `Diagram` render
    else if (!partIsDisplayed) setTimeout(() => emitter.emit("viewBasics"));

    // timeout because this will trigger re-render for this component, which throws a React error because we're in the middle of rendering it already
    setTimeout(() => clearPartIdToCentralize());
  }

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
          String.raw` [&:has(.spotlight-primary)_.react-flow\_\_edge-arrow.spotlight-normal]:blur-[5px]` +
          String.raw` [&_.react-flow\_\_node]:transition-[filter] [&_.react-flow\_\_node]:duration-300` +
          String.raw` [&_.diagram-edge]:transition-[filter] [&_.diagram-edge]:duration-300` +
          String.raw` [&_.react-flow\_\_edge-path]:transition-[filter] [&_.react-flow\_\_edge-path]:duration-300` +
          String.raw` [&_.react-flow\_\_edge-arrow]:transition-[filter] [&_.react-flow\_\_edge-arrow]:duration-300`
        }
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
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
  return (
    // wrap in provider so we can use react-flow state https://reactflow.dev/docs/api/react-flow-provider/
    <ReactFlowProvider>
      <DiagramWithoutProvider />
    </ReactFlowProvider>
  );
};
