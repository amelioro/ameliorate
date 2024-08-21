import { Typography } from "@mui/material";
import { StepType } from "@reactour/tour";
import Image from "next/image";

import { Link } from "@/web/common/components/Link";
import { celebrateGif } from "@/web/common/urls";
import { StepContent } from "@/web/tour/StepContent";
import { tourDefaultAnchorClass, viewsPaneSelector } from "@/web/tour/tourUtils";

export const navigatingTopicSteps: StepType[] = [
  {
    selector: viewsPaneSelector,
    content: (
      <StepContent
        stepTitle="Quick Views"
        text={
          <span>
            Quick Views allow you to easily jump between different aspects of a topic.
            <br />
            <br />
            Found in the Views Pane on the side, they're a good place to start when trying to
            understand a topic.
          </span>
        }
        imageSlot={
          <>
            <Image
              src="https://github.com/user-attachments/assets/17014abe-f9c5-4ca2-b95d-9683e2b1034b"
              alt="clicking between views in cars-going-too-fast topic"
              width={666}
              height={448}
              key="https://github.com/user-attachments/assets/17014abe-f9c5-4ca2-b95d-9683e2b1034b"
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
    selector: `.${tourDefaultAnchorClass}`,
    content: (
      <StepContent
        stepTitle="More details"
        text={
          <span>
            Indicators convey at-a-glance where extra details are.
            <br />
            <br />
            Details can be found by selecting the piece and looking at the Details Pane.
          </span>
        }
        imageSlot={
          <>
            <Image
              src="https://github.com/user-attachments/assets/bc02d4e2-5507-49d6-bd10-a32ea0ebd841"
              alt="indicators"
              width={600}
              height={467}
              key="https://github.com/user-attachments/assets/bc02d4e2-5507-49d6-bd10-a32ea0ebd841"
            />
          </>
        }
      />
    ),
  },
  {
    selector: `.${tourDefaultAnchorClass}`,
    content: (
      <StepContent
        stepTitle="Perspectives"
        text={
          <span>
            If you're logged in, you'll see your own scores, otherwise you'll see the scores of the
            topic's creator.
            <br />
            <br />
            You can compare multiple people's scores via the Compare button, or select specific
            perspectives via the More Actions Drawer.
          </span>
        }
        imageSlot={
          <Image
            src="https://github.com/user-attachments/assets/bdf7fd16-d44a-4a74-8e5e-24cd577dc647"
            alt="viewing other perspectives"
            width={492}
            height={411}
            key="https://github.com/user-attachments/assets/bdf7fd16-d44a-4a74-8e5e-24cd577dc647"
          />
        }
      />
    ),
  },
  {
    selector: `.${tourDefaultAnchorClass}`,
    content: (
      <StepContent
        stepTitle='Completed "Navigating a topic"! 🎉'
        text="Yay! You've learned the basics for viewing in Ameliorate. Now you can go forth and understand other people's topics! 🔥"
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
