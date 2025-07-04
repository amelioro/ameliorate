import { useContext, useRef, useState } from "react";

import { htmlDefaultFontSize } from "@/pages/_document.page";
import { useSessionUser } from "@/web/common/hooks";
import { BackdropPopper, CircleDiv, ScorePopper } from "@/web/topic/components/Score/Score.styles";
import { ScoreButton, buttonDiameterRem } from "@/web/topic/components/Score/ScoreButton";
import { ScoreCompare } from "@/web/topic/components/Score/ScoreCompare";
import { ScoreSelect } from "@/web/topic/components/Score/ScoreSelect";
import { WorkspaceContext } from "@/web/topic/components/TopicWorkspace/WorkspaceContext";
import { useUserScores } from "@/web/topic/diagramStore/scoreHooks";
import { playgroundUsername } from "@/web/topic/diagramStore/store";
import { useFlowZoom } from "@/web/topic/hooks/flowHooks";
import { useOnPlayground } from "@/web/topic/topicStore/store";
import { userCanEditScores } from "@/web/topic/utils/score";
import { useReadonlyMode } from "@/web/view/actionConfigStore";
import { useAggregationMode, usePerspectives } from "@/web/view/perspectiveStore";
import { useShowScores } from "@/web/view/userConfigStore";

const circleDiameter = 6 * buttonDiameterRem; // no collisions for fitting 10 elements

interface ScoreProps {
  graphPartId: string;
}

// similar to MUI speed dial (https://mui.com/material-ui/react-speed-dial/),
// but the main reason for creating a custom component is:
// * allow actions to be positioned around the dial for even closer navigability to each one
export const Score = ({ graphPartId }: ScoreProps) => {
  const { sessionUser } = useSessionUser();
  const onPlayground = useOnPlayground();
  const workspaceContext = useContext(WorkspaceContext);

  const showScores = useShowScores();
  const readonlyMode = useReadonlyMode();

  const myUsername = onPlayground ? playgroundUsername : sessionUser?.username;
  const perspectives = usePerspectives();
  const aggregationMode = useAggregationMode();
  const canEdit = userCanEditScores(myUsername, perspectives, readonlyMode);

  const [selected, setSelected] = useState(false);
  const [hovering, setHovering] = useState(false);
  // thanks for delay impl: https://stackoverflow.com/a/59417556/8409296
  const [hoverDelayHandler, setHoverDelayHandler] = useState<NodeJS.Timeout | undefined>(undefined);
  const mainButtonRef = useRef<HTMLButtonElement | null>(null);

  const userScores = useUserScores(graphPartId, perspectives);

  // Not reactive, but zoom is currently only used when hovering/selected change, which triggers a
  // re-render, so we'll still get an updated zoom value.
  const zoomRatio = useFlowZoom(); // TODO?: create a "zoomContext" so that criteria table and summary can also affect score pie's zoom

  const buttonDiameterPx =
    mainButtonRef.current?.clientHeight ?? buttonDiameterRem * htmlDefaultFontSize;

  const isComparing = Object.keys(userScores).length > 1;

  const hoverCircle = isComparing ? (
    <ScoreCompare userScores={userScores} />
  ) : canEdit ? (
    <ScoreSelect
      username={myUsername}
      graphPartId={graphPartId}
      onSelect={() => {
        setSelected(false);
        setHovering(false);
      }}
    />
  ) : undefined;
  const isInteractive = hoverCircle !== undefined;

  // Nice to show scores in details view so there's some way for new users to be exposed to them.
  // Always show score on table because the main purpose of the table is to compare scores.
  const showScore = workspaceContext === "table" || workspaceContext === "details" || showScores;
  const showScoreClasses = showScore ? "" : " hidden";

  if (!isInteractive) {
    return (
      <ScoreButton
        userScores={userScores}
        aggregationMode={aggregationMode}
        className={showScoreClasses}
      />
    );
  }

  return (
    <>
      <ScoreButton
        buttonRef={mainButtonRef}
        onClick={(event) => {
          event.stopPropagation(); // don't select the graph part when clicking
          setSelected(true);
        }}
        // delay hover so that the score pie doesn't get in the way when you're not intending to score
        // 100 ms matches the default for MUI tooltips https://mui.com/material-ui/api/tooltip/#Tooltip-prop-enterDelay
        onMouseEnter={() => setHoverDelayHandler(setTimeout(() => setHovering(true), 100))}
        onMouseLeave={() => clearTimeout(hoverDelayHandler)}
        userScores={userScores}
        aggregationMode={aggregationMode}
        className={showScoreClasses}
      />

      <BackdropPopper
        id="backdrop-popper"
        open={hovering || selected}
        isPieSelected={selected}
        // Not used, since size is stretched to screen, but without this MUI will throw really
        // annoying errors. This is an easier fix than converting the popper to a modal, which
        // would probably be a more correct solution (per MUI's intentions for the components).
        anchorEl={mainButtonRef.current}
        onClick={(e) => {
          // prevents parent node from being selected
          e.stopPropagation();
          setSelected(false);
        }}
        onMouseEnter={() => setHovering(false)}
        onWheel={() => {
          setSelected(false);
          setHovering(false);
        }}
      />

      {/* We're using Popper because it doesn't seem possible to handle z-index in such a way that
      the score is brought in front of the header and body table cells in the criteria table,
      due to how the parent stacking contexts are set up. */}
      {/* jank: zoom needs to be manually applied to the popper & its children because it is not a child of the flow element */}
      {/* cannot just apply scale to Popper because Popper sets transform in styles in order to position next to anchor, and scale affects that */}
      <ScorePopper
        id="scoring-popper"
        open={hovering || selected}
        onClick={(e) =>
          // prevents parent node from being selected
          e.stopPropagation()
        }
        anchorEl={mainButtonRef.current}
        modifiers={[
          {
            name: "offset",
            options: {
              // position centered on top of the main button https://popper.js.org/docs/v2/modifiers/offset/
              offset: [0, -buttonDiameterPx * zoomRatio],
            },
          },
        ]}
      >
        <CircleDiv circleDiameter={circleDiameter * zoomRatio}>{hoverCircle}</CircleDiv>

        {/* second button here because we want Pie to display in front of everything except the button... user isn't supposed to know there's two */}
        <ScoreButton
          onClick={() => setSelected(!selected)}
          userScores={userScores}
          aggregationMode={aggregationMode}
          zoomRatio={zoomRatio}
        />
      </ScorePopper>
    </>
  );
};
