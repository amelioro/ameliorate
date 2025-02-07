import { Button, Typography } from "@mui/material";
import { StepType } from "@reactour/tour";
import Image from "next/image";

import { Link } from "@/web/common/components/Link";
import { celebrateGif } from "@/web/common/urls";
import { NodeTypeText } from "@/web/topic/components/NodeTypeText/NodeTypeText";
import { StepContent } from "@/web/tutorial/StepContent";
import { startTutorial } from "@/web/tutorial/tutorial";
import { tutorialDefaultAnchorClass } from "@/web/tutorial/tutorialUtils";

export const breakdownSteps: StepType[] = [
  {
    selector: `.${tutorialDefaultAnchorClass}`,
    content: (
      <StepContent
        stepTitle="Laying things out"
        text={
          <span>
            Generally, <NodeTypeText type="problem" /> details are placed at the top, with{" "}
            <NodeTypeText type="solution" /> details across from them at the bottom. Solution
            tradeoffs (<NodeTypeText type="criterion" />) are in between.
            <br />
            <br />
            You can check out{" "}
            <Link href="https://ameliorate.app/examples/ontology" target="_blank">
              ontology
            </Link>{" "}
            if you want to see every type of node, with examples of each.
          </span>
        }
        imageSlot={
          <>
            <Image
              key="https://github.com/user-attachments/assets/dc5029a6-51c5-4b03-92c8-ed67ab9eb500"
              src="https://github.com/user-attachments/assets/dc5029a6-51c5-4b03-92c8-ed67ab9eb500"
              alt="layout of details via cars-going-too-fast"
              width={1237}
              height={911}
            />
            <Typography variant="caption">
              From:{" "}
              <Link
                href="https://ameliorate.app/examples/detailed-cars-going-too-fast?view=All+structure"
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
        stepTitle="Problem details"
        text={
          <span>
            Problems are mainly broken down into <NodeTypeText type="cause" /> and{" "}
            <NodeTypeText type="effect" />, and these can have their own causes and effects.
            <br />
            <br />
            Effects can be neutral (<NodeTypeText type="effect" />
            ), positive (<NodeTypeText type="benefit" />
            ), or negative (<NodeTypeText type="detriment" />
            ). Problems usually have negative effects.
          </span>
        }
        imageSlot={
          <>
            <Image
              key="https://github.com/user-attachments/assets/7d6769ba-a20d-419e-b72f-280a25fc4a79"
              src="https://github.com/user-attachments/assets/7d6769ba-a20d-419e-b72f-280a25fc4a79"
              alt="problem details of climate-change"
              width={711}
              height={572}
            />
            <Typography variant="caption">
              From:{" "}
              <Link
                href="https://ameliorate.app/examples/climate-change?view=Causes+and+concerns"
                target="_blank"
              >
                climate-change
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
        stepTitle="Solution details"
        text={
          <span>
            Solutions can be broken down into <NodeTypeText type="solutionComponent" />,{" "}
            <NodeTypeText type="effect" />, and <NodeTypeText type="obstacle" />. Obstacles convey
            something that restricts implementation of the solution.
            <br />
            <br />
            Components can also have their own effects and obstacles.
          </span>
        }
        imageSlot={
          <>
            <Image
              key="https://github.com/user-attachments/assets/a1121e7a-0845-4a92-937e-2f168e34a871"
              src="https://github.com/user-attachments/assets/a1121e7a-0845-4a92-937e-2f168e34a871"
              alt="solution details of mta-congestion-pricing"
              width={653}
              height={545}
            />
            <Typography variant="caption">
              From:{" "}
              <Link href="https://ameliorate.app/keyserj/mta-congestion-pricing" target="_blank">
                mta-congestion-pricing
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
        stepTitle="How solutions address problems"
        text={
          <span>
            You can tie specific solution details directly to specific problem details in order to
            convey exactly how a solution addresses a problem.
          </span>
        }
        imageSlot={
          <>
            <Image
              key="https://github.com/user-attachments/assets/03dc8f21-b7da-46db-bbee-ebacd490d016"
              src="https://github.com/user-attachments/assets/03dc8f21-b7da-46db-bbee-ebacd490d016"
              alt="showing that a benefit addresses a cause"
              width={738}
              height={636}
              unoptimized // without this, nextjs sometimes tries to optimize the gif as an image - not sure why only sometimes though; thanks https://github.com/vercel/next.js/discussions/18628#discussioncomment-4036940
            />
            <Typography variant="caption">
              From:{" "}
              <Link
                href="https://ameliorate.app/examples/detailed-cars-going-too-fast"
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
        stepTitle="Criteria"
        text={
          <span>
            Solutions can also be indirectly tied to problems through{" "}
            <NodeTypeText type="criterion" />.
            <br />
            <br />
            Criteria represent tradeoffs between solutions, and should be worded as something good
            about a solution, so that solutions can be easily compared with them.
          </span>
        }
        imageSlot={
          <>
            <Image
              key="https://github.com/user-attachments/assets/d3467cd8-f805-46cf-a5e5-84a031ad98cc"
              src="https://github.com/user-attachments/assets/d3467cd8-f805-46cf-a5e5-84a031ad98cc"
              alt="showing a benefit fulfilling a criterion"
              width={627}
              height={547}
            />
            <Typography variant="caption">
              From:{" "}
              <Link
                href="https://ameliorate.app/examples/detailed-cars-going-too-fast?view=All+structure"
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
        stepTitle='Completed "Breaking down a problem"! 🎉'
        text="Woohoo! Next, learn how to add nuance to your topic."
        actionSlot={
          <Button variant="contained" onClick={() => startTutorial("addingNuance", "builders")}>
            Next: Nuance
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
  },
];
