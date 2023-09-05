import { type ButtonProps, type Palette } from "@mui/material";
import { useRef, useState } from "react";

import { htmlDefaultFontSize } from "../../../../pages/_document.page";
import { useSessionUser } from "../../../common/hooks";
import { useTopicZoom } from "../../hooks/topicHooks";
import { useUserCanEditTopicData } from "../../store/userHooks";
import { type GraphPartType, type Score as ScoreData } from "../../utils/diagram";
import { indicatorLengthRem } from "../../utils/node";
import { BackdropPopper, ScorePopper, StyledButton } from "./Score.styles";
import { ScorePie } from "./ScorePie";

export const scoreColors: Record<ScoreData, keyof Palette> = {
  "-": "neutral",
  "1": "critique1",
  "2": "critique2",
  "3": "critique3",
  "4": "critique4",
  "5": "paper",
  "6": "support4",
  "7": "support3",
  "8": "support2",
  "9": "support1",
};

interface ScoreProps {
  graphPartId: string;
  graphPartType: GraphPartType;
  score: ScoreData;
}

// similar to MUI speed dial (https://mui.com/material-ui/react-speed-dial/),
// but the main reason for creating a custom component are:
// * allow actions to be positioned around the dial for even closer navigability to each one
export const Score = ({ graphPartId, graphPartType, score }: ScoreProps) => {
  const { sessionUser } = useSessionUser();
  const userCanEditTopicData = useUserCanEditTopicData(sessionUser?.username);
  const [selected, setSelected] = useState(false);
  const [hovering, setHovering] = useState(false);
  const mainButtonRef = useRef<HTMLButtonElement | null>(null);

  // Not reactive, but zoom is currently only used when hovering/selected change, which triggers a
  // re-render, so we'll still get an updated zoom value.
  const zoomRatio = useTopicZoom();

  const buttonLengthRem = indicatorLengthRem; //rem
  const buttonLengthRemScaled = buttonLengthRem * zoomRatio; //rem * zoom
  const circleDiameter = 6 * buttonLengthRemScaled; // no collisions for fitting 10 elements

  const buttonHeightPx =
    mainButtonRef.current?.clientHeight ?? buttonLengthRem * htmlDefaultFontSize;

  const scoreColor = scoreColors[score] as ButtonProps["color"]; // not sure how to type this without type assertion, while still being able to access palette with it

  if (!userCanEditTopicData) {
    return (
      <StyledButton
        buttonLength={buttonLengthRem}
        variant="contained"
        color={scoreColor}
        sx={{ pointerEvents: "none" }}
      >
        {/* i bet material icons would look way nicer than this text... but material only has number icons 1-6 :( */}
        {score}
      </StyledButton>
    );
  }

  return (
    <>
      <StyledButton
        onClick={() => setSelected(true)}
        onMouseEnter={() => setHovering(true)}
        buttonLength={buttonLengthRem}
        variant="contained"
        color={scoreColor}
        ref={mainButtonRef}
      >
        {/* i bet material icons would look way nicer than this text... but material only has number icons 1-6 :( */}
        {score}
      </StyledButton>

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
              offset: [0, -buttonHeightPx * zoomRatio],
            },
          },
        ]}
      >
        <ScorePie
          circleDiameter={circleDiameter}
          graphPartId={graphPartId}
          graphPartType={graphPartType}
        />

        {/* second button here because we want Pie to display in front of everything except the button... user isn't supposed to know there's two */}
        {/* TODO: extract ScoreButton component for reuse - couldn't figure out how to get forwardref to work */}
        <StyledButton
          onClick={() => setSelected(!selected)}
          buttonLength={buttonLengthRemScaled}
          variant="contained"
          color={scoreColor}
          zoomRatio={zoomRatio}
        >
          {/* i bet material icons would look way nicer than this text... but material only has number icons 1-6 :( */}
          {score}
        </StyledButton>
      </ScorePopper>
    </>
  );
};
