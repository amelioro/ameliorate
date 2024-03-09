import { Stack, Tooltip } from "@mui/material";

export const ShowSecondaryNeighborsLabel = () => {
  return (
    <Stack direction="row" alignItems="center">
      Show
      <Tooltip
        title={
          <span>
            Secondary nodes are those that aren't the focus of the current diagram.
            <br />
            <br />
            For example, question and fact nodes are secondary in the topic diagram, and problem and
            solution nodes are secondary in the research diagram.
          </span>
        }
        enterTouchDelay={0} // allow touch to immediately trigger
        leaveTouchDelay={Infinity} // touch-away to close on mobile, since message is long
      >
        <span style={{ textDecoration: "underline", marginLeft: "4px", marginRight: "4px" }}>
          Secondary
        </span>
      </Tooltip>
      Neighbors
    </Stack>
  );
};
