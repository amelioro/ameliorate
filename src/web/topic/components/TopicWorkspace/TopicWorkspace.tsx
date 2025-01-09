import { Global, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { useMediaQuery } from "@mui/material";
import { useHotkeys } from "react-hotkeys-hook";

import { ContextMenu } from "@/web/common/components/ContextMenu/ContextMenu";
import { useSessionUser } from "@/web/common/hooks";
import { CriteriaTable } from "@/web/topic/components/CriteriaTable/CriteriaTable";
import { Diagram } from "@/web/topic/components/Diagram/Diagram";
import { TopicPane } from "@/web/topic/components/TopicPane/TopicPane";
import { AppHeader } from "@/web/topic/components/TopicWorkspace/AppHeader";
import { ContentFooter } from "@/web/topic/components/TopicWorkspace/ContentFooter";
import { ContentHeader } from "@/web/topic/components/TopicWorkspace/ContentHeader";
import { TourSetter } from "@/web/topic/components/TopicWorkspace/TourSetter";
import { TutorialAnchor } from "@/web/topic/components/TopicWorkspace/TutorialAnchor";
import { TutorialController } from "@/web/topic/components/TopicWorkspace/TutorialController";
import { WorkspaceContext } from "@/web/topic/components/TopicWorkspace/WorkspaceContext";
import { setScore } from "@/web/topic/store/actions";
import { playgroundUsername } from "@/web/topic/store/store";
import { isOnPlayground } from "@/web/topic/store/utilActions";
import { Score, possibleScores } from "@/web/topic/utils/graph";
import { hotkeys } from "@/web/topic/utils/hotkeys";
import { userCanEditScores } from "@/web/topic/utils/score";
import { getReadonlyMode, toggleReadonlyMode } from "@/web/view/actionConfigStore";
import { getSelectedGraphPart, setSelected, useFormat } from "@/web/view/currentViewStore/store";
import { getPerspectives } from "@/web/view/perspectiveStore";
import { toggleShowIndicators } from "@/web/view/userConfigStore";

const useWorkspaceHotkeys = (user: { username: string } | null | undefined) => {
  useHotkeys([hotkeys.deselectPart], () => setSelected(null));
  useHotkeys([hotkeys.showIndicators], () => toggleShowIndicators());
  useHotkeys([hotkeys.readonlyMode], () => toggleReadonlyMode());

  useHotkeys([hotkeys.score], (_, hotkeysEvent) => {
    const selectedPart = getSelectedGraphPart();
    if (!selectedPart || !hotkeysEvent.keys) return;
    const [score] = hotkeysEvent.keys;
    if (!score || !possibleScores.some((s) => score === s)) return;

    // seems slightly awkward that there's logic here not reused with the Score component, but hard to reuse that in a clean way
    const myUsername = isOnPlayground() ? playgroundUsername : user?.username;
    if (!userCanEditScores(myUsername, getPerspectives(), getReadonlyMode())) return;
    setScore(myUsername, selectedPart.id, score as Score);
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

  return (
    // h-svh to force workspace to take up full height of screen
    <div className="relative flex h-svh flex-col">
      <AppHeader />

      <div
        className={`relative flex size-full overflow-auto ${isLandscape ? "flex-row" : "flex-col-reverse"}`}
      >
        <WorkspaceContext.Provider value="details">
          <TopicPane
            anchor={isLandscape ? "left" : "bottom"}
            tabs={useSplitPanes ? ["Details"] : ["Details", "Views"]}
          />
        </WorkspaceContext.Provider>

        <ContentDiv className="relative flex h-full flex-1 flex-col overflow-auto">
          <ContentHeader overlay={format === "diagram"} />

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

          <ContentFooter overlay={format === "diagram"} />
        </ContentDiv>

        {useSplitPanes && (
          <WorkspaceContext.Provider value="details">
            <TopicPane anchor="right" tabs={["Views"]} />
          </WorkspaceContext.Provider>
        )}

        {/* prevents body scrolling when workspace is rendered*/}
        <Global styles={{ body: { overflow: "hidden" } }} />
      </div>

      <ContextMenu />

      <TourSetter />
      <TutorialAnchor />
      <TutorialController />
    </div>
  );
};

const ContentDiv = styled.div``;
