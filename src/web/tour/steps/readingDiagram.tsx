import { Button, Typography } from "@mui/material";
import { StepType } from "@reactour/tour";
import Image from "next/image";

import { Link } from "@/web/common/components/Link";
import { celebrateGif } from "@/web/common/urls";
import { NodeTypeText } from "@/web/topic/components/NodeTypeText/NodeTypeText";
import { StepContent } from "@/web/tour/StepContent";
import { startTour } from "@/web/tour/tour";
import { Tour, tourDefaultAnchorClass } from "@/web/tour/tourUtils";

export const getReadingDiagramSteps = (nextTour?: Tour | null): StepType[] => [
  {
    selector: `.${tourDefaultAnchorClass}`,
    content: (
      <StepContent
        stepTitle="Nodes and edges"
        text={
          <span>
            We use nodes to represent concepts, and edges to represent relations between those.
            <br />
            <br />
            Here we have a <NodeTypeText type="problem" /> node saying that "cars going too fast" is
            a problem, and an edge from the <NodeTypeText type="cause" /> that indicates "street
            goes downhill" causes (to some extent) cars to go too fast.
          </span>
        }
        imageSlot={
          <Image
            src="https://github.com/user-attachments/assets/14892d89-d970-407d-bb41-64dd6ae4ac6b"
            alt="Edges"
            width={273}
            height={324}
            key="https://github.com/user-attachments/assets/14892d89-d970-407d-bb41-64dd6ae4ac6b"
          />
        }
      />
    ),
  },
  {
    selector: `.${tourDefaultAnchorClass}`,
    content: (
      <StepContent
        stepTitle="Diagram layout"
        text={
          <span>
            Generally, <NodeTypeText type="problem" /> details are laid at the top, with{" "}
            <NodeTypeText type="solution" /> details at the bottom across from those, and solution
            tradeoffs (<NodeTypeText type="criterion" />) in between.
            <br />
            <br />
            You can check out{" "}
            <Link href="https://ameliorate.app/examples/ontology" target="_blank">
              ontology
            </Link>{" "}
            if you want to see all possible types of nodes, with examples of each.
          </span>
        }
        imageSlot={
          <>
            <Image
              src="https://github.com/user-attachments/assets/dc5029a6-51c5-4b03-92c8-ed67ab9eb500"
              alt="layout of details via cars-going-too-fast"
              width={1237}
              height={911}
              key="https://github.com/user-attachments/assets/dc5029a6-51c5-4b03-92c8-ed67ab9eb500"
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
    selector: `.${tourDefaultAnchorClass}`,
    content: (
      <StepContent
        stepTitle="Scoring"
        text={
          <span>
            Scores convey positive or negative opinion about a node or edge. If you're logged in,
            you can score other people's topics.
            <br />
            <br />
            Here we're saying that we think pedestrians getting hit is a big concern, and that
            people getting places faster is a benefit but we don't care about it at all.
          </span>
        }
        imageSlot={
          <Image
            src="https://github.com/user-attachments/assets/47b18abe-cf40-47cf-9b18-f376dfbe7723"
            alt="scoring a node"
            width={434}
            height={328}
            key="https://github.com/user-attachments/assets/47b18abe-cf40-47cf-9b18-f376dfbe7723"
          />
        }
      />
    ),
  },
  nextTour === undefined
    ? {
        selector: `.${tourDefaultAnchorClass}`,
        content: (
          <StepContent
            stepTitle='Completed "Reading a diagram"! 🎉'
            text="Woot woot! Next, learn how to navigate all the information in a topic."
            actionSlot={
              <Button variant="contained" onClick={() => startTour("navigatingTopic")}>
                Next: Navigating
              </Button>
            }
            imageSlot={
              <Image
                src={celebrateGif}
                alt="Celebrate completed tutorial!"
                width={256}
                height={143}
                key={celebrateGif}
              />
            }
          />
        ),
      }
    : {
        selector: `.${tourDefaultAnchorClass}`,
        content: (
          <StepContent
            stepTitle='Completed "Reading a diagram"! 🎉'
            text="Woot woot! Now you're ready to understand other people's diagrams in Ameliorate 🔥."
            imageSlot={
              <Image
                src={celebrateGif}
                alt="Celebrate completed tutorial!"
                width={256}
                height={143}
                key={celebrateGif}
              />
            }
          />
        ),
      },
];
