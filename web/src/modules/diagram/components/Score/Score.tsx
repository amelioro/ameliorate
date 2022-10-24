import { useState } from "react";

import { ScoreSpan, StyledSlider } from "./Score.style";

export const Score = () => {
  const initialScore = 7;
  const [score, setScore] = useState(initialScore);

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    if (newValue instanceof Array) {
      throw new Error("slider should not have range value");
    }

    setScore(newValue);
  };

  return (
    <>
      <ScoreSpan>
        {/* nodrag is a hack to stop parent react flow component from preventing drag events i.e. sliding, see https://github.com/wbkd/react-flow/issues/2077 */}
        <StyledSlider
          aria-label="Score"
          onChange={handleSliderChange}
          className="nodrag"
          marks
          size="small"
          step={1}
          min={1}
          max={10}
          defaultValue={initialScore}
        />
        {score}
      </ScoreSpan>
    </>
  );
};
