import { Stack, Tooltip } from "@mui/material";
import startCase from "lodash/startCase";

import { InfoCategory } from "@/common/infoCategory";

interface Props {
  secondaryInfoCategory: InfoCategory;
}

export const ShowSecondaryNeighborsLabel = ({ secondaryInfoCategory }: Props) => {
  return (
    <Stack direction="row" alignItems="center">
      Show
      <Tooltip
        title={
          <span>
            Secondary nodes are those of an information category not being displayed, but that
            neighbor nodes that are of an information category being displayed.
            <br />
            <br />
            For example, question and fact nodes are secondary if Research nodes are not being
            displayed, but they're relevant for a problem node (and Breakdown nodes are being
            displayed).
          </span>
        }
        enterTouchDelay={0} // allow touch to immediately trigger
        leaveTouchDelay={Infinity} // touch-away to close on mobile, since message is long
      >
        <span style={{ textDecoration: "underline", marginLeft: "4px", marginRight: "4px" }}>
          Secondary
        </span>
      </Tooltip>
      {startCase(secondaryInfoCategory)}
    </Stack>
  );
};
