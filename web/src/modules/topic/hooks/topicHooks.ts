// these are different from hooks in topic/store/ because they don't necessarily use the store

import { useViewport } from "reactflow";

export const useTopicZoom = () => {
  try {
    // expect to error if we aren't within react-flow, e.g. in the criteria table
    const viewport = useViewport();
    return viewport.zoom;
  } catch {
    return 1;
  }
};
