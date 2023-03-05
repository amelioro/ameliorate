import _ from "lodash";
import { useState } from "react";

import { setScore, viewOrCreateClaimDiagram } from "../../store/actions";
import { type ScorableType, type Score, possibleScores } from "../../utils/diagram";
import { indicatorLength } from "../../utils/nodes";
import { FloatingButton, MainButton, StyledPopper } from "./ScoreDial.styles";

const getButtonPositions = (expansionRadius: number, numberOfButtons: number) => {
  const degreesPerScore = 360 / numberOfButtons;

  const positions = _.range(numberOfButtons).map((index) => {
    const degrees = 180 - degreesPerScore * index; // use 180 to flip because '-' was showing at bottom

    // thanks stackoverflow https://stackoverflow.com/a/43642346
    const x = expansionRadius * Math.sin((Math.PI * 2 * degrees) / 360);
    const y = expansionRadius * Math.cos((Math.PI * 2 * degrees) / 360);

    return { x, y };
  });

  return positions;
};

interface ScoreDialProps {
  scorableId: string;
  scorableType: ScorableType;
  score: Score;
}

// similar to MUI speed dial (https://mui.com/material-ui/react-speed-dial/),
// but the main reasons for creating a custom component are:
// * allow dial click to be different than hover. will want to eventually make this work reasonably on mobile, but for desktop this seems very useful
// * allow actions to be positioned around the dial for even closer navigability to each one
//
// TODO:
// * use radial slider with notches instead of buttons:
// 11 buttons are too many to fit close to the main button without collisions,
// and button text is hard to fit in a small spot (i.e. corner of an EditableNode)
// ... although... would "-" work well in a slider? want to allow the ability to deselect a score
export const ScoreDial = ({ scorableId, scorableType, score }: ScoreDialProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const buttonLength = indicatorLength; //px
  const expansionRadius = 2 * buttonLength; // no collisions for fitting 11 elements

  // little awkward to use parallel arrays, but wanted to isolate position logic
  const buttonPositions = getButtonPositions(expansionRadius, possibleScores.length);

  const floatingButtons = possibleScores.map((possibleScore, index) => {
    return (
      <FloatingButton
        buttonLength={buttonLength}
        position={buttonPositions[index]}
        key={possibleScore}
        variant="contained"
        color="neutral"
        onClick={() => setScore(scorableId, scorableType, possibleScore)}
      >
        {possibleScore}
      </FloatingButton>
    );
  });

  return (
    <>
      <MainButton
        onClick={() => viewOrCreateClaimDiagram(scorableId, scorableType)}
        onMouseEnter={(event) => setAnchorEl(event.currentTarget)}
        buttonLength={buttonLength}
        variant="contained"
        color="neutral"
      >
        {score}
      </MainButton>

      <StyledPopper
        id="simple-popper"
        // Somewhat jank - right now the popper doesn't have a background, so MouseLeave triggers
        // when moving mouse off of any of the buttons, which could be back towards the main button.
        // I think the plan will be to use a whole pie menu instead of floating buttons,
        // and that shouldn't have this problem.
        onMouseLeave={() => setAnchorEl(null)}
        modifiers={[
          {
            name: "offset",
            options: {
              // position centered on top of the main button https://popper.js.org/docs/v2/modifiers/offset/
              offset: [(-1 * buttonLength) / 2, -1 * buttonLength],
            },
          },
        ]}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
      >
        {floatingButtons}
      </StyledPopper>
    </>
  );
};
