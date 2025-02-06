import { Button } from "@mui/material";
import { StepType } from "@reactour/tour";

import { Link } from "@/web/common/components/Link";
import { discordInvite } from "@/web/common/urls";
import { StepContent } from "@/web/tutorial/StepContent";
import { startTutorial } from "@/web/tutorial/tutorial";
import { Track } from "@/web/tutorial/tutorialUtils";

export const welcomeSteps = (track: Track): StepType[] => {
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
              You can start tutorials and track your progress here, and it has links to docs and
              examples.
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
            track === "builders" ? (
              <Button
                variant="contained"
                onClick={() => startTutorial("diagramBasics", "builders")}
              >
                Start: Diagram Basics
              </Button>
            ) : track === "diagramViewers" ? (
              <Button
                variant="contained"
                onClick={() => startTutorial("readingDiagram", "diagramViewers")}
              >
                Start: Reading Diagrams
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={() => startTutorial("evaluatingTradeoffs", "tableViewers")}
              >
                Start: Evaluating Tradeoffs
              </Button>
            )
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
