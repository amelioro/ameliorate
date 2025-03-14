import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Link, Tab, Typography } from "@mui/material";
import Image from "next/image";
import { useState } from "react";

type Tab = "views" | "disagree" | "tradeoffs" | "flashlight";

const copy = {
  views: {
    title: "Focus on different aspects",
    description: "Create views to highlight specific parts of the diagram.",
    content: (
      <div>
        <Image
          src="https://github.com/user-attachments/assets/87055acd-debb-45f2-981f-ef511e770222"
          alt="clicking between views in cars-going-too-fast topic"
          width={1096}
          height={847}
          unoptimized // warning without this - gifs aren't optimized by nextjs apparently
          // extra padding & bg because spacing seems to look better
          className="rounded-xl border bg-paperPlain-main p-2 shadow"
        />
        <Typography variant="caption">
          Topic:{" "}
          <Link href="https://ameliorate.app/examples/detailed-cars-going-too-fast" target="_blank">
            cars-going-too-fast
          </Link>
        </Typography>
      </div>
    ),
  },
  disagree: {
    title: "Quickly identify where you disagree",
    description:
      "Compare scores to efficiently understand where your opinions lie in relation to others.",
    content: (
      <div>
        <Image
          src="https://github.com/user-attachments/assets/c1c9043a-4a0f-4af6-a309-ab3574301054"
          alt="comparing scores in cars-going-too-fast topic"
          width={756}
          height={703}
          unoptimized // warning without this - gifs aren't optimized by nextjs apparently
          className="rounded-xl border shadow"
        />
        <Typography variant="caption">
          Topic:{" "}
          <Link href="https://ameliorate.app/examples/detailed-cars-going-too-fast" target="_blank">
            cars-going-too-fast
          </Link>
        </Typography>
      </div>
    ),
  },
  tradeoffs: {
    title: "Summarize tradeoffs between solutions",
    description:
      "Show how important you think each tradeoff is, and how well each solution fulfills that tradeoff.",
    content: (
      <div>
        <Image
          src="https://github.com/user-attachments/assets/60ac157d-03f7-4fa5-907b-b8e3abab0e7a"
          alt="criteria tables of cars-going-too-fast"
          width={727}
          height={455}
          unoptimized
          // extra padding & bg because spacing seems to look better
          className="rounded-xl border bg-paperPlain-main p-3 shadow"
        />
        <Typography variant="caption">
          Topic:{" "}
          <Link
            href="https://ameliorate.app/examples/detailed-cars-going-too-fast?view=Tradeoff+table"
            target="_blank"
          >
            cars-going-too-fast
          </Link>
        </Typography>
      </div>
    ),
  },
  flashlight: {
    title: "Move through complex diagrams",
    description: "Use flashlight mode to easily explore large diagrams.",
    content: (
      <div>
        <Image
          src="https://github.com/user-attachments/assets/98d75b2b-6ca4-41cd-9322-314c75126232"
          alt="using flashlight mode in brutality-sugar topic"
          width={1022}
          height={728}
          unoptimized // warning without this - gifs aren't optimized by nextjs apparently
          className="rounded-xl border shadow"
        />
        <Typography variant="caption">
          Topic:{" "}
          <Link href="https://ameliorate.app/keyserj/brutality-sugar-article" target="_blank">
            brutality-sugar-article
          </Link>
        </Typography>
      </div>
    ),
  },
};

export const FeaturesSection = () => {
  const [selectedCard, setSelectedCard] = useState<Tab>("views");

  return (
    <div className="flex flex-col text-center">
      <Typography variant="h4">Some cool features</Typography>

      <TabContext value={selectedCard}>
        <TabList onChange={(_, value: Tab) => setSelectedCard(value)} variant="fullWidth">
          <Tab label={copy.views.title} value="views" wrapped />
          <Tab label={copy.disagree.title} value="disagree" wrapped />
          <Tab label={copy.tradeoffs.title} value="tradeoffs" wrapped />
          <Tab label={copy.flashlight.title} value="flashlight" wrapped />
        </TabList>

        <TabPanel
          key="views"
          // Using `selectedCard` here instead of `views` is a hack to keep the panels all mounted, so that
          // the images don't have to reload every time a tab is clicked.
          // TODO: after mui v6 upgrade, instead of this hack, can use `keepMounted` https://github.com/mui/material-ui/issues/37398
          value={selectedCard}
          // value="views"
          className={
            "items-center gap-2 p-0" +
            // `hidden` is specified only because the hack above prevents the panels from knowing when they should be hidden
            (selectedCard === "views" ? " flex flex-col" : " hidden")
          }
        >
          <Typography variant="body1" className="pt-3">
            {copy.views.description}
          </Typography>
          {copy.views.content}
        </TabPanel>

        <TabPanel
          key="disagree"
          // Using `selectedCard` here instead of `disagree` is a hack to keep the panels all mounted, so that
          // the images don't have to reload every time a tab is clicked.
          // TODO: after mui v6 upgrade, instead of this hack, can use `keepMounted` https://github.com/mui/material-ui/issues/37398
          value={selectedCard}
          // value="disagree"
          className={
            "items-center gap-2 p-0" +
            // `hidden` is specified only because the hack above prevents the panels from knowing when they should be hidden
            (selectedCard === "disagree" ? " flex flex-col" : " hidden")
          }
        >
          <Typography variant="body1" className="pt-3">
            {copy.disagree.description}
          </Typography>
          {copy.disagree.content}
        </TabPanel>

        <TabPanel
          key="tradeoffs"
          // Using `selectedCard` here instead of `tradeoffs` is a hack to keep the panels all mounted, so that
          // the images don't have to reload every time a tab is clicked.
          // TODO: after mui v6 upgrade, instead of this hack, can use `keepMounted` https://github.com/mui/material-ui/issues/37398
          value={selectedCard}
          // value="tradeoffs"
          className={
            "items-center gap-2 p-0" +
            // `hidden` is specified only because the hack above prevents the panels from knowing when they should be hidden
            (selectedCard === "tradeoffs" ? " flex flex-col" : " hidden")
          }
        >
          <Typography variant="body1" className="pt-3">
            {copy.tradeoffs.description}
          </Typography>
          {copy.tradeoffs.content}
        </TabPanel>

        <TabPanel
          key="flashlight"
          // Using `selectedCard` here instead of `flashlight` is a hack to keep the panels all mounted, so that
          // the images don't have to reload every time a tab is clicked.
          // TODO: after mui v6 upgrade, instead of this hack, can use `keepMounted` https://github.com/mui/material-ui/issues/37398
          value={selectedCard}
          // value="flashlight"
          className={
            "items-center gap-2 p-0" +
            // `hidden` is specified only because the hack above prevents the panels from knowing when they should be hidden
            (selectedCard === "flashlight" ? " flex flex-col" : " hidden")
          }
        >
          <Typography variant="body1" className="pt-3">
            {copy.flashlight.description}
          </Typography>
          {copy.flashlight.content}
        </TabPanel>
      </TabContext>
    </div>
  );
};
