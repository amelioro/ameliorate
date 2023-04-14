import { type ButtonProps, type Palette } from "@mui/material";
import _ from "lodash";
import { useEffect, useRef, useState } from "react";

import { useTopicZoom } from "../../hooks/topicHooks";
import { type ArguableType, type Score as ScoreData } from "../../utils/diagram";
import { indicatorLength } from "../../utils/node";
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
  arguableId: string;
  arguableType: ArguableType;
  score: ScoreData;
}

// similar to MUI speed dial (https://mui.com/material-ui/react-speed-dial/),
// but the main reason for creating a custom component are:
// * allow actions to be positioned around the dial for even closer navigability to each one
export const Score = ({ arguableId, arguableType, score }: ScoreProps) => {
  const zoomRatio = useTopicZoom();
  const [selected, setSelected] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [refButtonHeight, setRefButtonHeight] = useState(0);
  const mainButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (mainButtonRef.current?.clientHeight) {
      setRefButtonHeight(mainButtonRef.current.clientHeight);
    }
  }, [mainButtonRef]);

  const buttonLength = indicatorLength; //rem
  const buttonLengthScaled = buttonLength * zoomRatio; //rem * zoom
  const circleDiameter = 6 * buttonLengthScaled; // no collisions for fitting 10 elements

  const scoreColor = scoreColors[score] as ButtonProps["color"]; // not sure how to type this without type assertion, while still being able to access palette with it

  return (
    <>
      <StyledButton
        onClick={() => setSelected(true)}
        onMouseEnter={() => setHovering(true)}
        buttonLength={buttonLength}
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
        onClick={(e) => {
          //prevents parent node from being selected
          e.stopPropagation();
          setSelected(false);
        }}
        onMouseEnter={() => setHovering(false)}
        onWheel={() => {
          setSelected(false);
          setHovering(false);
        }}
      />
      {/* jank: zoom needs to be manually applied to the popper & its children because it is not a child of the flow element */}
      {/* cannot just apply scale to Popper because Popper sets transform in styles in order to position next to anchor, and scale affects that */}
      <ScorePopper
        id="scoring-popper"
        open={hovering || selected}
        onClick={(e) =>
          //prevents parent node from being selected
          e.stopPropagation()
        }
        anchorEl={mainButtonRef.current}
        modifiers={[
          {
            name: "offset",
            options: {
              // position centered on top of the main button https://popper.js.org/docs/v2/modifiers/offset/
              offset: [0, -refButtonHeight * zoomRatio],
            },
          },
        ]}
      >
        <ScorePie
          circleDiameter={circleDiameter}
          arguableId={arguableId}
          arguableType={arguableType}
        />

        {/* second button here because we want Pie to display in front of everything except the button... user isn't supposed to know there's two */}
        {/* TODO: extract ScoreButton component for reuse - couldn't figure out how to get forwardref to work */}
        <StyledButton
          onClick={() => setSelected(!selected)}
          buttonLength={buttonLengthScaled}
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
