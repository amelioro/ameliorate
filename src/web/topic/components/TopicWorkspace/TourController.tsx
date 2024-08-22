/**
 * see "auto-start" in tutorial-paths.md for diagram of logic here
 */

import { useTour } from "@reactour/tour";
import { useEffect, useState } from "react";

import { useSessionUser } from "@/web/common/hooks";
import { useUserCanEditTopicData } from "@/web/topic/store/userHooks";
import { startTour, startWelcomeTour } from "@/web/tour/tour";
import {
  getTourHasCompleted,
  getTourHasStarted,
  getTourIsOpening,
  setTourIsOpening,
} from "@/web/tour/tourStore";
import { Tour } from "@/web/tour/tourUtils";
import { useFormat } from "@/web/view/currentViewStore/store";

export const TourController = () => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const format = useFormat();
  const [oldFormat, setOldFormat] = useState(format);
  const formatChanged = oldFormat !== format;

  const tourProps = useTour();

  // tours to auto start on initial render
  useEffect(() => {
    // tourIsOpening is a hack to prevent starting diagramBasics immediately after welcome when this effect runs twice in a row, before tourProps.isOpen is updated
    if (getTourIsOpening() || tourProps.isOpen) return;

    if (!getTourHasCompleted("welcome")) {
      const nextTour: Tour = userCanEditTopicData
        ? "diagramBasics"
        : format === "diagram"
          ? "readingDiagram"
          : "evaluatingTradeoffs";

      startWelcomeTour(nextTour);
      setTourIsOpening(true);
      return;
    }

    if (userCanEditTopicData && !getTourHasStarted("diagramBasics")) {
      startTour("diagramBasics");
      setTourIsOpening(true);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- want this to only run on initial render (and second render in the case of react strict mode being on)
  }, []);

  // tours to auto start when format changes
  if (formatChanged) {
    if (
      !userCanEditTopicData &&
      format === "diagram" &&
      !getTourHasStarted("readingDiagram") &&
      !getTourHasStarted("diagramBasics") // don't start Viewers tutorial if already did Builders because Builders is more comprehensive than Viewers
    ) {
      // timeout to prevent error rendering TourProvider within TourController (startTour results in such a render)
      setTimeout(() => startTour("readingDiagram", null));
      setTourIsOpening(true);
      return;
    }

    if (format === "table" && !getTourHasStarted("evaluatingTradeoffs")) {
      // timeout to prevent error rendering TourProvider within TourController (startTour results in such a render)
      setTimeout(() => startTour("evaluatingTradeoffs", null));
      setTourIsOpening(true);
      return;
    }
  }

  if (getTourIsOpening() && tourProps.isOpen) setTourIsOpening(false);
  if (formatChanged) setOldFormat(format);

  return <></>;
};
