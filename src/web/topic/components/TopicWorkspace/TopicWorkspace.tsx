import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { SelfImprovement } from "@mui/icons-material";
import { ToggleButton, useMediaQuery } from "@mui/material";
import { useHotkeys } from "react-hotkeys-hook";

import { ContextMenu } from "@/web/common/components/ContextMenu/ContextMenu";
import { InfoDialog } from "@/web/common/components/InfoDialog/InfoDialog";
import { SiteBanner } from "@/web/common/components/SiteBanner/SiteBanner";
import { useSessionUser } from "@/web/common/hooks";
import { Summary } from "@/web/summary/components/Summary";
import { CriteriaTable } from "@/web/topic/components/CriteriaTable/CriteriaTable";
import { Diagram } from "@/web/topic/components/Diagram/Diagram";
import { TopicPane } from "@/web/topic/components/TopicPane/TopicPane";
import { AppHeader } from "@/web/topic/components/TopicWorkspace/AppHeader";
import { MainToolbar } from "@/web/topic/components/TopicWorkspace/MainToolbar";
import { TourSetter } from "@/web/topic/components/TopicWorkspace/TourSetter";
import { TutorialAnchor } from "@/web/topic/components/TopicWorkspace/TutorialAnchor";
import { TutorialController } from "@/web/topic/components/TopicWorkspace/TutorialController";
import { ViewToolbar } from "@/web/topic/components/TopicWorkspace/ViewToolbar";
import { WorkspaceContext } from "@/web/topic/components/TopicWorkspace/WorkspaceContext";
import { setScore } from "@/web/topic/diagramStore/actions";
import { playgroundUsername } from "@/web/topic/diagramStore/store";
import { isOnPlayground } from "@/web/topic/topicStore/store";
import { Score, possibleScores } from "@/web/topic/utils/graph";
import { hotkeys } from "@/web/topic/utils/hotkeys";
import { userCanEditScores } from "@/web/topic/utils/score";
import { getReadonlyMode, toggleReadonlyMode } from "@/web/view/actionConfigStore";
import { useFormat } from "@/web/view/currentViewStore/store";
import { getPerspectives } from "@/web/view/perspectiveStore";
import { getSelectedGraphPart, setSelected } from "@/web/view/selectedPartStore";
import { toggleZenMode, useZenMode } from "@/web/view/userConfigStore";

const useWorkspaceHotkeys = (user: { username: string } | null | undefined) => {
  useHotkeys([hotkeys.deselectPart], () => setSelected(null));
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

const ZenModeButton = () => {
  return (
    <ToggleButton
      value={true}
      selected={true}
      title="Zen mode"
      aria-label="Zen mode"
      color="primary"
      size="small"
      onClick={() => toggleZenMode()}
      className="absolute bottom-0 left-0 z-10 rounded border-none"
    >
      <SelfImprovement />
    </ToggleButton>
  );
};

export const workspaceId = "workspace";

export const TopicWorkspace = () => {
  const { sessionUser } = useSessionUser();

  useWorkspaceHotkeys(sessionUser);

  const format = useFormat();
  const theme = useTheme();
  const using2xlScreen = useMediaQuery(theme.breakpoints.up("2xl"));
  const useSplitPanes = using2xlScreen;
  const usingLgScreen = useMediaQuery(theme.breakpoints.up("lg"));

  const zenMode = useZenMode();

  return (
    // h-svh to force workspace to take up full height of screen.
    // overflow-hidden to prevent scrollbars when showing e.g. tooltips/poppers (e.g. node toolbar/score pie)
    // because there can be infinite flickering where hover creates scrollbars which create shift which stop hover which stop shift which moves element back under mouse and starts hover again
    <div id={workspaceId} className="relative flex h-svh flex-col overflow-hidden">
      <SiteBanner />

      {!zenMode && <AppHeader />}

      <div className="relative flex w-full grow flex-row overflow-auto">
        <WorkspaceContext.Provider value="details">
          <TopicPane
            anchor={usingLgScreen ? "left" : "modal"}
            tabs={useSplitPanes ? ["Details"] : ["Details", "Views"]}
          />
        </WorkspaceContext.Provider>

        <ContentDiv className="relative flex h-full flex-1 flex-col overflow-auto">
          {!zenMode && usingLgScreen && (
            <ViewToolbar overlay={format === "diagram"} position="top" />
          )}
          {zenMode && <ZenModeButton />}

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

          {format === "summary" && (
            <WorkspaceContext.Provider value="summary">
              <Summary />
            </WorkspaceContext.Provider>
          )}

          {!zenMode && !usingLgScreen && (
            <ViewToolbar overlay={format === "diagram"} position="bottom" />
          )}
          {!zenMode && <MainToolbar />}
        </ContentDiv>

        {useSplitPanes && (
          <WorkspaceContext.Provider value="details">
            <TopicPane anchor="right" tabs={["Views"]} />
          </WorkspaceContext.Provider>
        )}
      </div>

      <ContextMenu />

      <InfoDialog />

      <TourSetter />
      <TutorialAnchor />
      <TutorialController />
    </div>
  );
};

const ContentDiv = styled.div``;
