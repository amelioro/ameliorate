import { Box, type ButtonProps, ClickAwayListener, type Palette } from "@mui/material";
import _ from "lodash";
import { useRef, useState } from "react";

import { useTopicZoom } from "../../hooks/topicHooks";
import { type ArguableType, type Score as ScoreData } from "../../utils/diagram";
import { indicatorLength } from "../../utils/node";
import { StyledButton, StyledPopper } from "./Score.styles";
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
  const zoom = useTopicZoom();
  const [selected, setSelected] = useState(false);
  const [hovering, setHovering] = useState(false);
  const mainButtonRef = useRef(null);

  const buttonLength = indicatorLength; //px
  const pieDiameter = 6 * buttonLength; // no collisions for fitting 11 elements

  const scoreColor = scoreColors[score] as ButtonProps["color"]; // not sure how to type this without type assertion, while still being able to access palette with it

  return (
    <>
      <ClickAwayListener
        onClickAway={() => {
          setSelected(false);
          setHovering(false); // mobile tap sets hovering, so we need to set false here as well
        }}
      >
        {/* need div to surround both the main button and the popper'd button with the clickawaylistener */}
        <Box display="flex">
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

          {/* jank: zoom needs to be manually applied to the popper & its children because it is not a child of the flow element */}
          {/* cannot just apply scale to Popper because Popper sets transform in styles in order to position next to anchor, and scale affects that */}
          <StyledPopper
            id="simple-popper"
            onMouseLeave={() => setHovering(false)}
            modifiers={[
              {
                name: "offset",
                options: {
                  // position centered on top of the main button https://popper.js.org/docs/v2/modifiers/offset/
                  offset: [0, -1 * ((pieDiameter * zoom) / 2 + (buttonLength * zoom) / 2)],
                },
              },
            ]}
            open={hovering || selected}
            anchorEl={mainButtonRef.current}
          >
            <ScorePie
              pieDiameter={pieDiameter * zoom}
              arguableId={arguableId}
              arguableType={arguableType}
            />

            {/* second button here because we want Pie to display in front of everything except the button... user isn't supposed to know there's two */}
            {/* TODO: extract ScoreButton component for reuse - couldn't figure out how to get forwardref to work */}
            <StyledButton
              onClick={() => setSelected(true)}
              onMouseEnter={() => setHovering(true)}
              buttonLength={buttonLength}
              variant="contained"
              color={scoreColor}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%) scale(${zoom})`,
              }}
            >
              {/* i bet material icons would look way nicer than this text... but material only has number icons 1-6 :( */}
              {score}
            </StyledButton>
          </StyledPopper>
        </Box>
      </ClickAwayListener>
    </>
  );
};
