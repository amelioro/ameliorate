import { createContext } from "react";

/**
 * Where the node is being rendered. One use case is e.g. knowing that a node was added from the diagram
 * so that only the node being rendered in the diagram is focused after add (as opposed to focusing
 * the node in the details pane).
 */
export type WorkspaceContextType = "details" | "diagram" | "table";

export const WorkspaceContext = createContext<WorkspaceContextType>("diagram");
