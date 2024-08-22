import { tourDefaultAnchorClass } from "@/web/tour/tourUtils";

export const TourAnchor = () => {
  // Seems like there's no way to position the tour without an anchor, so here's one for when we
  // don't have a particular element we care to point out.
  return <div className={`${tourDefaultAnchorClass} invisible absolute -bottom-2 right-0`} />;
};
