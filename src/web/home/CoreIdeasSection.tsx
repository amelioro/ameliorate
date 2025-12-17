import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Tab, Typography } from "@mui/material";
import Image from "next/image";
import { useState } from "react";

import { Link } from "@/web/common/components/Link";

type Tab = "diagram" | "details";

const copy = {
  diagram: {
    title: "Problem-Solving Diagram",
    description: `Lay out causes and effects, showing exactly how situations can be improved. This creates a concrete visual in which discussion can be grounded.`,
    image: (
      <Image
        src="https://github.com/user-attachments/assets/4ef151aa-ebd3-4a4d-b2af-259d7a55a285"
        alt="problem solving diagram"
        // want to be a max height of 600px - resolution is scaled from 1189x1440 (not using max-h because we still want to avoid layout shift)
        width={495.416}
        height={600}
        unoptimized
        className="rounded-xl border shadow-sm"
      />
    ),
  },
  details: {
    title: '"Humble" Information',
    description: `Each individual detail invites scrutiny in a structured manner. Anything can be scored, justified, questioned, have relevant facts, and more.`,
    image: (
      <Image
        src="https://github.com/user-attachments/assets/06808ff9-f785-4ec6-9369-3cede79d9249"
        alt="humble information"
        // want to be a max height of 600px - resolution is scaled from 558x809 (not using max-h because we still want to avoid layout shift)
        width={413.84}
        height={600}
        unoptimized
        // extra padding & bg because spacing seems to look better
        className="rounded-xl border bg-paperPlain-main p-3 shadow-sm"
      />
    ),
  },
};

export const CoreIdeasSection = () => {
  const [selectedCard, setSelectedCard] = useState<Tab>("diagram");

  return (
    <div className="flex flex-col text-center">
      <Typography variant="h4">Break things down</Typography>

      <TabContext value={selectedCard}>
        <TabList
          onChange={(_, value: Tab) => setSelectedCard(value)}
          // super jank, but it doesn't seem like there's a standard way to center MUI tabs while still having them scroll into view if they're overflowed
          // so here 470px is the exact width of the two tabs side-by-side; if the screen is larger, they need to be centered, otherwise they need to scroll
          // note: if user had increased default font size, this won't be correct :( but it seems that rem can't be used for breakpoints https://stackoverflow.com/a/51993054/8409296
          // this seems ok though because 470 to ~700px width screens seem almost nonexistent
          className="min-[470px]:[&_.MuiTabs-flexContainer]:justify-center"
        >
          <Tab label={copy.diagram.title} value="diagram" />
          <Tab label={copy.details.title} value="details" />
        </TabList>

        <TabPanel
          key="diagram"
          value="diagram"
          keepMounted
          classes={{ root: "p-0 flex flex-col items-center gap-2" }}
        >
          <Typography variant="body1" className="pt-3">
            {copy.diagram.description}
          </Typography>
          {copy.diagram.image}
        </TabPanel>

        <TabPanel
          key="details"
          value="details"
          keepMounted
          classes={{ root: "p-0 flex flex-col items-center gap-2" }}
        >
          <Typography variant="body1" className="pt-3">
            {copy.details.description}
          </Typography>
          {copy.details.image}
        </TabPanel>
      </TabContext>

      <Typography variant="body2" className="mt-2">
        See{" "}
        <Link href="/examples/ontology" target="_blank">
          ontology
        </Link>{" "}
        for an interactive visual of all information types in Ameliorate
      </Typography>
    </div>
  );
};
