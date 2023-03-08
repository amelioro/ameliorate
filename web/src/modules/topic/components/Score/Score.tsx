import { Box, ClickAwayListener } from "@mui/material";
import _ from "lodash";
import { useRef, useState } from "react";

import { type ArguableType, type Score as ScoreData } from "../../utils/diagram";
import { indicatorLength } from "../../utils/nodes";
import { ScorePie } from "../ScorePie/ScorePie";
import { StyledButton, StyledPopper } from "./Score.styles";

interface ScoreProps {
  arguableId: string;
  arguableType: ArguableType;
  score: ScoreData;
}

// similar to MUI speed dial (https://mui.com/material-ui/react-speed-dial/),
// but the main reason for creating a custom component are:
// * allow actions to be positioned around the dial for even closer navigability to each one
export const Score = ({ arguableId, arguableType, score }: ScoreProps) => {
  const [selected, setSelected] = useState(false);
  const [hovering, setHovering] = useState(false);
  const mainButtonRef = useRef(null);

  const buttonLength = indicatorLength; //px
  const pieDiameter = 6 * buttonLength; // no collisions for fitting 11 elements

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
            color="neutral"
            ref={mainButtonRef}
          >
            {/* i bet material icons would look way nicer than this text... but material only has number icons 1-6 :( */}
            {score}
          </StyledButton>

          <StyledPopper
            id="simple-popper"
            onMouseLeave={() => setHovering(false)}
            modifiers={[
              {
                name: "offset",
                options: {
                  // position centered on top of the main button https://popper.js.org/docs/v2/modifiers/offset/
                  offset: [0, -1 * ((indicatorLength * 6) / 2 + indicatorLength / 2)],
                },
              },
            ]}
            open={hovering || selected}
            anchorEl={mainButtonRef.current}
          >
            <ScorePie
              pieDiameter={pieDiameter}
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
              color="neutral"
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
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
