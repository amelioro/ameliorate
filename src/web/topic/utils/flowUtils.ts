import {
  type EdgeProps as DefaultEdgeProps,
  type NodeProps as DefaultNodeProps,
  type Edge,
  type Node,
} from "@xyflow/react";

import { EdgeLayoutData } from "@/web/topic/utils/diagram";
import { LayoutedNode } from "@/web/topic/utils/layout";

/**
 * Match padding used by React Flow's fitView https://github.com/xyflow/xyflow/blob/ede221a7ad9555763edc2321033d3c3e61261da2/packages/system/src/utils/graph.ts#L375
 */
export const defaultFitViewPadding = 0.1;

/**
 * React Flow passes this type into custom Node components (e.g. EditableNode).
 *
 * It differs from `ReactFlowNode` because this has some data calculated during rendering like
 * handle positions. `ReactFlowNode` also has some DOM/CSS-specific props on it.
 */
export interface FlowNodeProps extends DefaultNodeProps {
  data: Pick<LayoutedNode, "ports">;
  type: "FlowNode"; // may as well be explicit so from the FlowNode component we know we're not getting e.g. `problem`/`benefit`/...
}

/**
 * React Flow passes this type into custom Edge components (e.g. ScoreEdge).
 *
 * This doesn't look very different from `ReactFlowEdge` but since the node version is different,
 * let's just make this one different too.
 */
export interface FlowEdgeProps extends DefaultEdgeProps {
  data: EdgeLayoutData;
  type: "FlowDirectEdge" | "FlowIndirectEdge"; // for some reason after reactflow 11->12, DefaultEdgeProps has optional type, but ReactFlow component expects it to be defined
}

/**
 * This type is passed into the ReactFlow component's `nodes` prop.
 */
export type ReactFlowNode = Node<FlowNodeProps["data"], "FlowNode">;

/**
 * This type is passed into the ReactFlow component's `edges` prop.
 */
export type ReactFlowEdge = Edge<FlowEdgeProps["data"], "FlowDirectEdge" | "FlowIndirectEdge">;
