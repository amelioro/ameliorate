import { Build } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { StepType } from "@reactour/tour";
import Image from "next/image";

import { Link } from "@/web/common/components/Link";
import { celebrateGif } from "@/web/common/urls";
import { NodeTypeText } from "@/web/topic/components/NodeTypeText/NodeTypeText";
import { StepContent } from "@/web/tutorial/StepContent";
import {
  quickViewDropdownSelector,
  tutorialDefaultAnchorClass,
  viewsPaneSelector,
} from "@/web/tutorial/tutorialUtils";

export const buildingViewsSteps: StepType[] = [
  {
    selector: quickViewDropdownSelector,
    content: (
      <StepContent
        stepTitle="Quick Views"
        text={
          <span>
            Quick Views allow you to easily jump between different views that you find useful.
            <br />
            <br />
            They can also be a good starting point for others to see what's important about your
            topic.
          </span>
        }
        imageSlot={
          <>
            <Image
              key="https://github.com/user-attachments/assets/87055acd-debb-45f2-981f-ef511e770222"
              src="https://github.com/user-attachments/assets/87055acd-debb-45f2-981f-ef511e770222"
              alt="clicking between views in cars-going-too-fast topic"
              width={1096}
              height={847}
              unoptimized // warning without this - gifs aren't optimized by nextjs apparently
              // extra padding & bg because spacing seems to look better
              className="rounded-xl border bg-paperPlain-main p-2 shadow"
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
    selector: viewsPaneSelector,
    content: (
      <StepContent
        stepTitle="Filters"
        text={
          <span>
            A view is made up of its filters and a few settings.
            <br />
            <br />
            There are Information Filters, General Filters, Table Filters (if you're viewing a
            table), and some Diagram Config in the More Actions Drawer <Build />.
          </span>
        }
        imageSlot={
          <>
            <Image
              key="https://github.com/user-attachments/assets/ebdaefb6-26fb-4eef-b710-34fa303f7ad4"
              src="https://github.com/user-attachments/assets/ebdaefb6-26fb-4eef-b710-34fa303f7ad4"
              alt="showing the kinds of filters"
              width={450}
              height={434}
              unoptimized // without this, nextjs sometimes tries to optimize the gif as an image - not sure why only sometimes though; thanks https://github.com/vercel/next.js/discussions/18628#discussioncomment-4036940
              className="rounded-xl border shadow"
            />
          </>
        }
      />
    ),
  },
  {
    selector: viewsPaneSelector,
    content: (
      <StepContent
        stepTitle="Information Filters"
        text={
          <span>
            Information Filters control filtering based on categories of info - Breakdown (
            <NodeTypeText type="problem" />,
            <NodeTypeText type="solution" />, etc), Research (
            <NodeTypeText type="question" />, <NodeTypeText type="fact" />,{" "}
            <NodeTypeText type="source" />, etc), and Justification (<NodeTypeText type="support" />
            , <NodeTypeText type="critique" />
            ).
            <br />
            <br />
            Here we're toggling on the Research category, which adds questions, facts, and sources
            to the diagram.
          </span>
        }
        imageSlot={
          <>
            <Image
              key="https://github.com/user-attachments/assets/edbc5e18-447e-4ae7-a0ae-00aa9f72e8c8"
              src="https://github.com/user-attachments/assets/edbc5e18-447e-4ae7-a0ae-00aa9f72e8c8"
              alt="toggling on and off some Information Filters"
              width={659}
              height={412}
              unoptimized // without this, nextjs sometimes tries to optimize the gif as an image - not sure why only sometimes though; thanks https://github.com/vercel/next.js/discussions/18628#discussioncomment-4036940
              className="rounded-xl border shadow"
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
    selector: viewsPaneSelector,
    content: (
      <StepContent
        stepTitle="General Filters"
        text={
          <span>
            General Filters control other filtering - e.g. which types of nodes to display,
            filtering by scores, specific nodes to show/hide regardless of other filters.
            <br />
            <br />
            Here we're filtering out <NodeTypeText type="cause" /> nodes, and choosing to override
            that to show the "street goes downhill" cause.
          </span>
        }
        imageSlot={
          <>
            <Image
              key="https://github.com/user-attachments/assets/533529a7-0de0-4c22-94cf-d9b00943399f"
              src="https://github.com/user-attachments/assets/533529a7-0de0-4c22-94cf-d9b00943399f"
              alt="changing some General Filters"
              width={659}
              height={369}
              unoptimized // without this, nextjs sometimes tries to optimize the gif as an image - not sure why only sometimes though; thanks https://github.com/vercel/next.js/discussions/18628#discussioncomment-4036940
              className="rounded-xl border shadow"
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
    selector: viewsPaneSelector,
    content: (
      <StepContent
        stepTitle="Hidden neighbors"
        text={
          <span>
            If a node's handle is blue, that means it has a neighbor that's currently being hidden
            by a filter.
            <br />
            <br />
            You can un-hide a hidden neighbor by clicking on the eye, or re-hide it by
            right-clicking and clicking hide.
          </span>
        }
        imageSlot={
          <>
            <Image
              key="https://github.com/user-attachments/assets/2ceccd62-e5ff-46ad-81cb-e0c564ed4269"
              src="https://github.com/user-attachments/assets/2ceccd62-e5ff-46ad-81cb-e0c564ed4269"
              alt="showing neighbor indicator"
              width={600}
              height={445}
              unoptimized // without this, nextjs sometimes tries to optimize the gif as an image - not sure why only sometimes though; thanks https://github.com/vercel/next.js/discussions/18628#discussioncomment-4036940
              className="rounded-xl border shadow"
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
    selector: viewsPaneSelector,
    content: (
      <StepContent
        stepTitle="Showing & hiding neighbors"
        text={
          <span>
            It's not uncommon to want to only look at a node and its neighbors, or to add all of a
            node's neighbors to the view.
            <br />
            <br />
            You can find actions for these by right-clicking on a node.
          </span>
        }
        imageSlot={
          <>
            <Image
              key="https://github.com/user-attachments/assets/0a2563db-5795-44ac-b0bd-e97292b4d18f"
              src="https://github.com/user-attachments/assets/0a2563db-5795-44ac-b0bd-e97292b4d18f"
              alt="showing and hiding neighbors"
              width={596}
              height={475}
              unoptimized // without this, nextjs sometimes tries to optimize the gif as an image - not sure why only sometimes though; thanks https://github.com/vercel/next.js/discussions/18628#discussioncomment-4036940
              className="rounded-xl border shadow"
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
    selector: viewsPaneSelector,
    content: (
      <StepContent
        stepTitle="Forcing nodes into layers"
        text={
          <span>
            One example of a view option that isn't a filter is the "Force nodes into layers"
            option.
            <br />
            <br />
            This lays out problems at the top, criteria in the middle, and solutions at the bottom.
            Sometimes it's desirable to turn this off and keep nodes closer together.
          </span>
        }
        imageSlot={
          <>
            <Image
              key="https://github.com/user-attachments/assets/0ca650fe-9497-4837-825c-1b980b4cae97"
              src="https://github.com/user-attachments/assets/0ca650fe-9497-4837-825c-1b980b4cae97"
              alt="forcing nodes into layers"
              width={591}
              height={516}
              unoptimized // without this, nextjs sometimes tries to optimize the gif as an image - not sure why only sometimes though; thanks https://github.com/vercel/next.js/discussions/18628#discussioncomment-4036940
              className="rounded-xl border shadow"
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
    selector: viewsPaneSelector,
    content: (
      <StepContent
        stepTitle="Saving Quick Views"
        text={
          <span>
            When you've got your view the way you want it, you can create a Quick View.
            <br />
            <br />
            If you change any filters after creating it and you want to update that view with new
            settings, you can click the save icon to re-save that view's settings.
          </span>
        }
        imageSlot={
          <>
            <Image
              key="https://github.com/user-attachments/assets/74c43ce1-ede5-4623-9563-17c3963a0e12"
              src="https://github.com/user-attachments/assets/74c43ce1-ede5-4623-9563-17c3963a0e12"
              alt="saving a Quick View"
              width={788}
              height={475}
              unoptimized // without this, nextjs sometimes tries to optimize the gif as an image - not sure why only sometimes though; thanks https://github.com/vercel/next.js/discussions/18628#discussioncomment-4036940
              className="rounded-xl border shadow"
            />
          </>
        }
      />
    ),
  },
  {
    selector: `.${tutorialDefaultAnchorClass}`,
    content: (
      <StepContent
        stepTitle='Completed "Building views"! 🎉'
        text="All right! You've finished learning all the basics for using Ameliorate. Now you can reap the fruits of your labor and start building some diagrams! 🔥"
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
