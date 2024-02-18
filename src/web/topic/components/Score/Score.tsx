import { useRef, useState } from "react";

import { htmlDefaultFontSize } from "../../../../pages/_document.page";
import { useSessionUser } from "../../../common/hooks";
import { usePerspectives } from "../../../view/perspectiveStore";
import { useFlowZoom } from "../../hooks/flowHooks";
import { useUserScores } from "../../store/scoreHooks";
import { playgroundUsername } from "../../store/store";
import { useOnPlayground } from "../../store/topicHooks";
import { BackdropPopper, CircleDiv, ScorePopper } from "./Score.styles";
import { ScoreButton, buttonDiameterRem } from "./ScoreButton";
import { ScoreCompare } from "./ScoreCompare";
import { ScoreSelect } from "./ScoreSelect";

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
  const myUsername = onPlayground ? playgroundUsername : sessionUser?.username;
  const perspectives = usePerspectives();
  const canEdit =
    perspectives.length === 1 && myUsername !== undefined && perspectives[0] === myUsername;

  const [selected, setSelected] = useState(false);
  const [hovering, setHovering] = useState(false);
  // thanks for delay impl: https://stackoverflow.com/a/59417556/8409296
  const [hoverDelayHandler, setHoverDelayHandler] = useState<NodeJS.Timeout | undefined>(undefined);
  const mainButtonRef = useRef<HTMLButtonElement | null>(null);

  const userScores = useUserScores(graphPartId, perspectives);

  // Not reactive, but zoom is currently only used when hovering/selected change, which triggers a
  // re-render, so we'll still get an updated zoom value.
  const zoomRatio = useFlowZoom();

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

  if (!isInteractive) {
    return <ScoreButton userScores={userScores} />;
  }

  return (
    <>
      <ScoreButton
        buttonRef={mainButtonRef}
        onClick={() => setSelected(true)}
        // delay hover so that the score pie doesn't get in the way when you're not intending to score
        // 100 ms matches the default for MUI tooltips https://mui.com/material-ui/api/tooltip/#Tooltip-prop-enterDelay
        onMouseEnter={() => setHoverDelayHandler(setTimeout(() => setHovering(true), 100))}
        onMouseLeave={() => clearTimeout(hoverDelayHandler)}
        userScores={userScores}
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
          zoomRatio={zoomRatio}
        />
      </ScorePopper>
    </>
  );
};
