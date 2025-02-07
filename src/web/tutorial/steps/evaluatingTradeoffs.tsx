import { AutoStories } from "@mui/icons-material";
import { Button, Typography } from "@mui/material";
import { StepType } from "@reactour/tour";
import Image from "next/image";

import { Link } from "@/web/common/components/Link";
import { celebrateGif } from "@/web/common/urls";
import { StepContent } from "@/web/tutorial/StepContent";
import { startTutorial } from "@/web/tutorial/tutorial";
import { Track, tutorialDefaultAnchorClass } from "@/web/tutorial/tutorialUtils";

export const getEvaluatingTradeoffsSteps = (track: Track | null): StepType[] => [
  {
    selector: `.${tutorialDefaultAnchorClass}`,
    content: (
      <StepContent
        stepTitle="Viewing the table"
        text={
          <span>
            The Criteria Table can help make it easier to compare tradeoffs of each solution. You
            can find it by right-clicking on a problem node.
            <br />
            <br />
            If you need to return to the diagram, you can change the format back to "Diagram" under
            VIEWS {">"} Format in the Topic pane <AutoStories color="primary" />.
          </span>
        }
        imageSlot={
          <Image
            key="https://github.com/user-attachments/assets/5ccc00a7-a3e9-439f-8e19-4d32106bfdef"
            src="https://github.com/user-attachments/assets/5ccc00a7-a3e9-439f-8e19-4d32106bfdef"
            alt="viewing criteria table"
            width={677}
            height={472}
            unoptimized // without this, nextjs sometimes tries to optimize the gif as an image - not sure why only sometimes though; thanks https://github.com/vercel/next.js/discussions/18628#discussioncomment-4036940
            className="rounded-xl border shadow"
          />
        }
      />
    ),
  },
  {
    selector: `.${tutorialDefaultAnchorClass}`,
    content: (
      <StepContent
        stepTitle="Scores"
        text={
          <span>
            Header scores convey how important we think the solutions and criteria are, and
            intersection scores convey how well we think a solution fulfills the criteria.
            <br />
            <br />
            Here, the scores show that the stop light solution isn't great. While we expect it'll
            get people to stop, it's not cheap, and traffic will be interrupted during
            implementation.
          </span>
        }
        imageSlot={
          <>
            <Image
              key="https://github.com/user-attachments/assets/1dd98e5e-198a-41ff-967a-099c7cbe430b"
              src="https://github.com/user-attachments/assets/1dd98e5e-198a-41ff-967a-099c7cbe430b"
              alt="criteria table scores"
              width={540}
              height={325}
              className="rounded-xl border shadow"
            />
            <Typography variant="caption">
              From:{" "}
              <Link
                href="https://ameliorate.app/examples/detailed-cars-going-too-fast?view=Tradeoff+table"
                target="_blank"
              >
                cars-going-too-fast
              </Link>
            </Typography>
          </>
        }
      />
    ),
  },
  {
    selector: `.${tutorialDefaultAnchorClass}`,
    content: (
      <StepContent
        stepTitle="Solution totals"
        text={
          <span>
            Solutions are given a calculated Solution Total to help show how good they are across
            all of the criteria.
            <br />
            <br />
            Positive indicates a good solution, negative indicates a bad solution. A detailed
            explanation of the calculation can be found by clicking the info icon in the table.
          </span>
        }
        imageSlot={
          <>
            <Image
              key="https://github.com/user-attachments/assets/f71c1dd1-0f60-4151-9b1d-ea207911ce60"
              src="https://github.com/user-attachments/assets/f71c1dd1-0f60-4151-9b1d-ea207911ce60"
              alt="solution totals"
              width={543}
              height={108}
              className="rounded-xl border shadow"
            />
            <Typography variant="caption">
              From:{" "}
              <Link
                href="https://ameliorate.app/examples/detailed-cars-going-too-fast?view=Tradeoff+table"
                target="_blank"
              >
                cars-going-too-fast
              </Link>
            </Typography>
          </>
        }
      />
    ),
  },
  track === "builders"
    ? {
        selector: `.${tutorialDefaultAnchorClass}`,
        content: (
          <StepContent
            stepTitle='Completed "Evaluating tradeoffs"! 🎉'
            text="Woot woot! Next and finally, learn how to build views to quickly look at different aspects of your topic."
            actionSlot={
              <Button variant="contained" onClick={() => startTutorial("buildingViews", track)}>
                Next: Building Views
              </Button>
            }
            imageSlot={
              <Image
                key={celebrateGif}
                src={celebrateGif}
                alt="Celebrate completed tutorial!"
                width={256}
                height={143}
              />
            }
          />
        ),
      }
    : track === "tableViewers"
      ? {
          selector: `.${tutorialDefaultAnchorClass}`,
          content: (
            <StepContent
              stepTitle='Completed "Evaluating tradeoffs"! 🎉'
              text="Woot woot! Next and finally, learn how to navigate all the information that's in a topic."
              actionSlot={
                <Button
                  variant="contained"
                  onClick={() => startTutorial("navigatingATopic", track)}
                >
                  Next: Navigating
                </Button>
              }
              imageSlot={
                <Image
                  key={celebrateGif}
                  src={celebrateGif}
                  alt="Celebrate completed tutorial!"
                  width={256}
                  height={143}
                  unoptimized // without this, nextjs sometimes tries to optimize the gif as an image - not sure why only sometimes though; thanks https://github.com/vercel/next.js/discussions/18628#discussioncomment-4036940
                />
              }
            />
          ),
        }
      : {
          selector: `.${tutorialDefaultAnchorClass}`,
          content: (
            <StepContent
              stepTitle='Completed "Evaluating tradeoffs"! 🎉'
              text="Woot woot! Now you're ready to compare solutions in Ameliorate 🔥."
              imageSlot={
                <Image
                  key={celebrateGif}
                  src={celebrateGif}
                  alt="Celebrate completed tutorial!"
                  width={256}
                  height={143}
                  unoptimized // without this, nextjs sometimes tries to optimize the gif as an image - not sure why only sometimes though; thanks https://github.com/vercel/next.js/discussions/18628#discussioncomment-4036940
                />
              }
            />
          ),
        },
];
