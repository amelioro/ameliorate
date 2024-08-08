/**
 * This file is separate from `tour.ts` so that steps can use the `reactour` without having a
 * circular dependency with `tour.ts`, which needs to reference the steps to load the tour.
 */

import { TourProps } from "@reactour/tour";

// eslint-disable-next-line functional/no-let -- this is a hack to allow accessing tour library methods outside of component tree, because that makes it all much easier to work with (no need to `useTour` in each component), and we shouldn't need to use these outside of the tree anyway
export let reactour: TourProps | null = null;

export const setReactTourProps = (props: TourProps) => {
  reactour = props;
};
