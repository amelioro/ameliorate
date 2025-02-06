/**
 * see "auto-start" in tutorial-paths.md for diagram of logic here
 */

import { useTour } from "@reactour/tour";
import { useEffect, useState } from "react";

import { useSessionUser } from "@/web/common/hooks";
import { useUserCanEditTopicData } from "@/web/topic/store/userHooks";
import { startTutorial, startWelcomeTutorial } from "@/web/tutorial/tutorial";
import {
  getTutorialHasCompleted,
  getTutorialHasStarted,
  getTutorialIsOpening,
  setTutorialIsOpening,
} from "@/web/tutorial/tutorialStore";
import { Track } from "@/web/tutorial/tutorialUtils";
import { useFormat } from "@/web/view/currentViewStore/store";

export const TutorialController = () => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);

  const format = useFormat();
  const [oldFormat, setOldFormat] = useState(format);
  const formatChanged = oldFormat !== format;

  const tourProps = useTour();

  // tutorials to auto start on initial render
  useEffect(() => {
    // tutorialIsOpening is a hack to prevent starting diagramBasics immediately after welcome when this effect runs twice in a row, before tourProps.isOpen is updated
    if (getTutorialIsOpening() || tourProps.isOpen) return;

    if (!getTutorialHasCompleted("welcome")) {
      const track: Track = userCanEditTopicData
        ? "builders"
        : format === "diagram"
          ? "diagramViewers"
          : "tableViewers";

      startWelcomeTutorial(track);
      setTutorialIsOpening(true);
      return;
    }

    if (userCanEditTopicData && !getTutorialHasStarted("diagramBasics")) {
      startTutorial("diagramBasics", "builders");
      setTutorialIsOpening(true);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- want this to only run on initial render (and second render in the case of react strict mode being on)
  }, []);

  // tutorials to auto start when format changes
  if (formatChanged) {
    if (
      format === "diagram" &&
      !userCanEditTopicData &&
      !getTutorialHasStarted("readingDiagram") &&
      !getTutorialHasStarted("diagramBasics") // don't start Viewers tutorial if already did Builders because Builders is more comprehensive than Viewers
    ) {
      // timeout to prevent error rendering TourProvider within TutorialController (startTutorial results in such a render)
      setTimeout(() => startTutorial("readingDiagram", null));
      setTutorialIsOpening(true);
    }

    if (format === "table" && !getTutorialHasStarted("evaluatingTradeoffs")) {
      // timeout to prevent error rendering TourProvider within TutorialController (startTutorial results in such a render)
      setTimeout(() => startTutorial("evaluatingTradeoffs", null));
      setTutorialIsOpening(true);
    }
  }

  if (getTutorialIsOpening() && tourProps.isOpen) setTutorialIsOpening(false);
  if (formatChanged) setOldFormat(format);

  return <></>;
};
