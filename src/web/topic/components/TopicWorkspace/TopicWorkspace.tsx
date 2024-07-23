import { Global, useTheme } from "@emotion/react";
import { useMediaQuery } from "@mui/material";
import { useTour } from "@reactour/tour";
import { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { ContextMenu } from "@/web/common/components/ContextMenu/ContextMenu";
import { useSessionUser } from "@/web/common/hooks";
import { CriteriaTable } from "@/web/topic/components/CriteriaTable/CriteriaTable";
import { Diagram } from "@/web/topic/components/Diagram/Diagram";
import { TopicPane } from "@/web/topic/components/TopicPane/TopicPane";
import { WorkspaceContext } from "@/web/topic/components/TopicWorkspace/WorkspaceContext";
import { WorkspaceToolbar } from "@/web/topic/components/TopicWorkspace/WorkspaceToolbar";
import { setScore } from "@/web/topic/store/actions";
import { playgroundUsername } from "@/web/topic/store/store";
import { isOnPlayground } from "@/web/topic/store/utilActions";
import { Score, possibleScores } from "@/web/topic/utils/graph";
import { hotkeys } from "@/web/topic/utils/hotkeys";
import { userCanEditScores } from "@/web/topic/utils/score";
import { getReadonlyMode, toggleReadonlyMode } from "@/web/view/actionConfigStore";
import { getSelectedGraphPartId, setSelected, useFormat } from "@/web/view/currentViewStore/store";
import { getPerspectives } from "@/web/view/perspectiveStore";
import { setHasVisitedWorkspace, useHasVisitedWorkspace } from "@/web/view/userConfigStore";

const useWorkspaceHotkeys = (user: { username: string } | null | undefined) => {
  useHotkeys([hotkeys.deselectPart], () => setSelected(null));
  useHotkeys([hotkeys.readonlyMode], () => toggleReadonlyMode());

  useHotkeys([hotkeys.score], (_, hotkeysEvent) => {
    const selectedPartId = getSelectedGraphPartId();
    if (!selectedPartId || !hotkeysEvent.keys) return;
    const [score] = hotkeysEvent.keys;
    if (!score || !possibleScores.some((s) => score === s)) return;

    // seems slightly awkward that there's logic here not reused with the Score component, but hard to reuse that in a clean way
    const myUsername = isOnPlayground() ? playgroundUsername : user?.username;
    if (!userCanEditScores(myUsername, getPerspectives(), getReadonlyMode())) return;
    setScore(myUsername, selectedPartId, score as Score);
  });
};

export const TopicWorkspace = () => {
  const { sessionUser } = useSessionUser();

  useWorkspaceHotkeys(sessionUser);

  const format = useFormat();
  const theme = useTheme();
  const isLandscape = useMediaQuery("(orientation: landscape)");
  const usingBigScreen = useMediaQuery(theme.breakpoints.up("2xl"));
  const useSplitPanes = isLandscape && usingBigScreen;

  const hasVisitedWorkspace = useHasVisitedWorkspace();
  const { setIsOpen: openTour } = useTour();

  useEffect(() => {
    if (!hasVisitedWorkspace) {
      openTour(true);
      setHasVisitedWorkspace();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- no need to check this beyond initial render; either open the tour or don't
  }, []);

  return (
    // hardcode workspace to take up full height of screen minus the navbar
    <div className="flex h-[calc(100svh-49px)] flex-col">
      <WorkspaceToolbar />

      <div
        className={`relative flex size-full overflow-auto ${isLandscape ? "flex-row" : "flex-col-reverse"}`}
      >
        <WorkspaceContext.Provider value="details">
          <TopicPane
            anchor={isLandscape ? "left" : "bottom"}
            tabs={useSplitPanes ? ["Views"] : ["Details", "Views"]}
          />
        </WorkspaceContext.Provider>

        <div className="flex h-full flex-1 overflow-auto">
          {format === "table" && (
            <WorkspaceContext.Provider value="table">
              <CriteriaTable />
            </WorkspaceContext.Provider>
          )}

          {format === "diagram" && (
            <WorkspaceContext.Provider value="diagram">
              <Diagram />
            </WorkspaceContext.Provider>
          )}
        </div>

        {useSplitPanes && (
          <WorkspaceContext.Provider value="details">
            <TopicPane anchor="right" tabs={["Details"]} />
          </WorkspaceContext.Provider>
        )}

        {/* prevents body scrolling when workspace is rendered*/}
        <Global styles={{ body: { overflow: "hidden" } }} />
      </div>

      <ContextMenu />
    </div>
  );
};
