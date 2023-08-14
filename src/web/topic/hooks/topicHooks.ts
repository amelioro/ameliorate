// these are different from hooks in topic/store/ because they don't necessarily use the store

import { useStoreApi } from "reactflow";

/**
 * Returns the zoom level of the flow diagram.
 *
 * This is intentionally not-reactive. Using a hook that fires whenever the viewport changes is very
 * slow. It's still a hook though because that's how reactflow exposes this data - presumably so
 * that the state can come from the nearest react flow provider.
 */
export const useTopicZoom = () => {
  // expect to error if we aren't within react-flow, e.g. in the criteria table
  try {
    // found by referring to useViewport code https://github.com/wbkd/react-flow/blob/6d9585c1a62bf549298c83ad5f2dcd6216a5b8eb/packages/core/src/hooks/useViewport.ts
    const transform = useStoreApi().getState().transform;
    return transform[2];
  } catch {
    return 1;
  }
};
