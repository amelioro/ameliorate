/**
 * This lives as a separate component so that tourProps can be set to be used outside of the
 * `useTour` hook, for ease of use, without causing re-renders for other sibling components.
 */

import { useTour } from "@reactour/tour";
import { useEffect, useMemo } from "react";

import { setReactTourProps } from "@/web/tour/reactourWrapper";

export const TourSetter = () => {
  const tourProps = useTour();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- hack to only update when values in tourProps change
  const memoTourProps = useMemo(() => tourProps, [JSON.stringify(tourProps)]);

  useEffect(() => {
    setReactTourProps(memoTourProps); // keep tour props up-to-date in a global variable for easy access
  }, [memoTourProps]);

  return <></>;
};
