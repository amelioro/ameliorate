import { Info } from "@mui/icons-material";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { useState } from "react";

export const TotalsHeaderCell = () => {
  const [showExactDetails, setShowExactDetails] = useState(false);

  return (
    <Stack direction="row" justifyContent="center" alignItems="center" height="100%">
      <Typography variant="body1">Solution Totals</Typography>
      <Tooltip
        title={
          <Box
            sx={{
              table: { borderCollapse: "collapse" },
              td: { border: "1px solid black", textAlign: "center" },
            }}
          >
            <span>
              A Solution's Total is an estimate of good the solution is. The total is positive if
              scores indicate that it fulfills the criteria, and negative if it doesn't. The
              importance scores of each criteria emphasize how positive or negative the total is.
              <br />
              <br />
              <button
                className="rounded border bg-gray-600 p-1 hover:bg-gray-700"
                onClick={() => setShowExactDetails(!showExactDetails)}
              >
                {!showExactDetails ? "Show exact details" : "Hide exact details"}
              </button>
              <br />
              <br />
            </span>

            {showExactDetails && (
              <>
                <span>
                  To represent that fulfilling is a good or bad thing, the fulfill scores are
                  shifted from the range 1 to 9, to the range -4 to 4.
                  <br />
                  To have the importance emphasize these fulfill scores, the importance is
                  multiplied by the fulfill score.
                  <br />
                  To represent that lowest importance should make fulfill scores irrelevant,
                  importance scores are shifted from the range 1 to 9, to the range 0 to 8.
                  <br />
                  <br />
                  The Solution Total is therefore calculated by multiplying the adjusted score of
                  how well the solution fulfills each criterion, times the adjusted score of how
                  important each criterion is, and summing these results.
                  <br />
                  <br />
                  For example, in the following table:
                </span>
                <table>
                  <tbody>
                    <tr>
                      <td>problem: cars going too fast in neighborhood</td>
                      <td>solution: stop sign</td>
                      <td>solution: kids at play sign</td>
                    </tr>
                    <tr>
                      <td>criterion: conveys reasoning to slow down (6)</td>
                      <td>1</td>
                      <td>9</td>
                    </tr>
                    <tr>
                      <td>criterion: actually gets cars to slow down (8)</td>
                      <td>8</td>
                      <td>1</td>
                    </tr>
                    <tr>
                      <td>Solution Score</td>
                      <td>1</td>
                      <td>-8</td>
                    </tr>
                  </tbody>
                </table>
                <br />
                <span>
                  the score for "stop sign" is calculated as:
                  <br />
                  (1-5) * (6-1) + (8-5) * (8-1) = 1,
                  <br />
                  and "kids at play sign" is calculated as:
                  <br />
                  (9-5) * (6-1) + (1-5) * (8-1) = -8.
                </span>
              </>
            )}
          </Box>
        }
        enterTouchDelay={0} // allow touch to immediately trigger
        leaveTouchDelay={Infinity} // touch-away to close on mobile, since message is long
      >
        <IconButton
          color="info"
          aria-label="Solution Totals info"
          sx={{
            // Don't make it look like clicking will do something, since it won't.
            // Using a button here is an attempt to make it accessible, since the tooltip will show
            // on focus.
            cursor: "default",
            alignSelf: "center",
          }}
        >
          <Info />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};
