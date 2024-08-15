import { Button } from "@mui/material";
import { StepType } from "@reactour/tour";

import { Link } from "@/web/common/components/Link";
import { discordInvite } from "@/web/common/urls";
import { StepContent } from "@/web/tour/StepContent";
import { startTour } from "@/web/tour/tour";

export const welcomeSteps = (userCanEditTopicData: boolean): StepType[] => {
  return [
    {
      selector: 'button[title="Help"] > svg',
      content: (
        <StepContent
          stepTitle="Welcome to Ameliorate 🔥"
          text={
            <>
              If you're ever unsure how to do something, click this question mark.
              <br />
              <br />
              You can start and see your progress on the tutorials here, and it has links to docs
              and examples.
              <br />
              <br />
              Feel free to also ask for help in the{" "}
              <Link href={discordInvite} target="_blank">
                Discord server
              </Link>
              .
            </>
          }
          actionSlot={
            userCanEditTopicData ? (
              <Button variant="contained" onClick={() => startTour("diagramBasics")}>
                Start: Diagram Basics
              </Button>
            ) : undefined
          }
          heightClass="" // override default to let height be based on content size here - we don't care about matching height of other steps because this tutorial only has one step
        />
      ),
      stepInteraction: false, // don't let users click the help button when it's highlighted, because the popover would awkwardly cover the opened menu
      styles: {
        maskWrapper: (props) => ({ ...props, display: "unset" }), // show the mask to spotlight the help button
      },
    },
  ];
};
