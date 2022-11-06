import _ from "lodash";

import {
  type ComponentType,
  PossibleScore,
  possibleScores,
  useDiagramStore,
} from "../Diagram.store";
import { FloatingButton, FloatingDiv, MainButton, StyledDiv } from "./Score.style";

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

interface ScoreProps {
  parentId: string;
  parentType: ComponentType;
  score: PossibleScore;
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
export const Score = ({ parentId, parentType, score }: ScoreProps) => {
  const scoreParent = useDiagramStore((state) => state.scoreParent);

  const buttonLength = 10; //px
  const expansionRadius = 2 * buttonLength; // no collisions for fitting 11 elements

  // little awkward to use parallel arrays, but wanted to extract position logic
  const buttonPositions = getButtonPositions(expansionRadius, possibleScores.length);

  const floatingButtons = possibleScores.map((possibleScore, index) => {
    return (
      <FloatingButton
        buttonLength={buttonLength}
        position={buttonPositions[index]}
        key={possibleScore}
        variant="contained"
        onClick={() => scoreParent(parentId, parentType, possibleScore)}
      >
        {possibleScore}
      </FloatingButton>
    );
  });

  return (
    <>
      <StyledDiv>
        {/* keep floating div as sibling to floating buttons so that each can be positioned relative to the MainButton */}
        {floatingButtons}
        <FloatingDiv radius={expansionRadius} buttonLength={buttonLength}></FloatingDiv>

        <MainButton buttonLength={buttonLength} variant="contained">
          {score}
        </MainButton>
      </StyledDiv>
    </>
  );
};
