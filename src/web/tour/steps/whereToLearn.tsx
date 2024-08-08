import { Button } from "@mui/material";
import { StepType } from "@reactour/tour";

import { Link } from "@/web/common/components/Link";
import { discordInvite, gettingStartedPage } from "@/web/common/urls";
import { StepContent } from "@/web/tour/StepContent";
import { startTour } from "@/web/tour/tour";

export const whereToLearnSteps = (userCanEditTopicData: boolean): StepType[] => {
  return [
    {
      selector: 'button[title="Help"] > svg',
      content: (
        <StepContent
          stepTitle="Welcome to Ameliorate 🔥"
          text={
            <>
              If you're ever unsure how to do something, you can find docs, examples, and tutorials
              by clicking this question mark (
              <Link href={gettingStartedPage} target="_blank">
                Getting Started
              </Link>{" "}
              is a good first section of the docs to read).
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
        />
      ),
      stepInteraction: false, // don't let users click the help button when it's highlighted, because the popover would awkwardly cover the opened menu
      styles: {
        maskWrapper: (props) => ({ ...props, display: "unset" }), // show the mask to spotlight the help button
      },
    },
  ];
};
