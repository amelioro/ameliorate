import { StepType } from "@reactour/tour";
import Image from "next/image";

import { celebrateGif } from "@/web/common/urls";
import { StepContent } from "@/web/tour/StepContent";
import { tourDefaultAnchorClass } from "@/web/tour/tourUtils";

export const diagramBasicsSteps: StepType[] = [
  {
    selector: `.${tourDefaultAnchorClass}`,
    content: (
      <StepContent
        stepTitle="Nodes"
        text={`Nodes are central to how you'll represent information.

Below is a problem node, which suggests that "cars going too fast in my neighborhood" is a problem.`}
        imageSlot={
          <Image
            src="https://github.com/user-attachments/assets/989d5310-6193-421c-9dac-aaaa55ba7ef6"
            alt="problem node - cars going too fast"
            width={305}
            height={159}
          />
        }
      />
    ),
  },
  {
    selector: `.${tourDefaultAnchorClass}`,
    content: (
      <StepContent
        stepTitle="Editing node text"
        text={`Edit a node's text by selecting the node, then clicking on the text.

Note that editing is only possible if you created the topic or if you were given editing privileges.`}
        imageSlot={
          <Image
            src="https://github.com/user-attachments/assets/ca5049a6-cb74-479a-a386-0fe22d2034e1"
            alt="editing node text"
            width={322}
            height={205}
          />
        }
      />
    ),
  },
  {
    selector: `.${tourDefaultAnchorClass}`,
    content: (
      <StepContent
        stepTitle="Adding a node"
        text={`When a node is selected, you can use the buttons that pop up to add related nodes.`}
        imageSlot={
          <Image
            src="https://github.com/user-attachments/assets/380f2603-33c9-46d7-997f-532831196ff4"
            alt="adding a node"
            width={527}
            height={387}
          />
        }
      />
    ),
  },
  {
    selector: `.${tourDefaultAnchorClass}`,
    content: (
      <StepContent
        stepTitle="Other actions"
        text={`Per-node actions, like delete, can be found by right-clicking a node, and other common actions like undo/redo are in the toolbar.

Advanced actions and configuration can be found by clicking on the More Actions wrench.`}
        imageSlot={
          <Image
            src="https://github.com/user-attachments/assets/61b07a44-bd48-49ef-b9ee-780b4c2a676c"
            alt="Other actions"
            width={413}
            height={476}
          />
        }
      />
    ),
  },
  {
    selector: `.${tourDefaultAnchorClass}`,
    content: (
      <StepContent
        stepTitle="Edges"
        text={`Edges represent relations between nodes. We can read this bottom-up like: "street goes downhill" - causes -> "cars going too fast", or in plain English: "The street's hill causes cars to go too fast".`}
        imageSlot={
          <Image
            src="https://github.com/user-attachments/assets/14892d89-d970-407d-bb41-64dd6ae4ac6b"
            alt="Edges"
            width={273}
            height={324}
          />
        }
      />
    ),
  },
  {
    selector: `.${tourDefaultAnchorClass}`,
    content: (
      <StepContent
        stepTitle='Completed "Diagram Basics"! 🎉'
        text="Yay! Now you're ready to build your own diagrams."
        imageSlot={
          <Image src={celebrateGif} alt="Celebrate completed tutorial!" width={256} height={143} />
        }
      />
    ),
  },
];
