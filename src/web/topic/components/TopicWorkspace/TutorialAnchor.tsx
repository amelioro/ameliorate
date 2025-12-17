import { tutorialDefaultAnchorClass } from "@/web/tutorial/tutorialUtils";

export const TutorialAnchor = () => {
  // Seems like there's no way to position the tutorial without an anchor, so here's one for when we
  // don't have a particular element we care to point out.
  return <div className={`${tutorialDefaultAnchorClass} invisible absolute right-0 -bottom-2`} />;
};
