import { EmojiObjects, EmojiObjectsOutlined } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Rating, Tab, Typography } from "@mui/material";
import Image from "next/image";
import { ReactNode, useEffect, useRef, useState } from "react";

import { Link } from "@/web/common/components/Link";

interface Example {
  title: string;
  href: string;
  category: string;
  text: ReactNode;
  complexity: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  image: ReactNode;
}

const examples = [
  {
    title: "mattresses",
    href: "https://ameliorate.app/keyserj/mattresses",
    category: "Personal decision",
    text: "Determine which mattress to purchase. Ameliorate is great at visualizing many options and their tradeoffs.",
    complexity: 2,
    image: (
      <Image
        key="https://github.com/user-attachments/assets/e2f7f706-a9d4-4cee-bd21-3e2c1b5f7ea7"
        src="https://github.com/user-attachments/assets/e2f7f706-a9d4-4cee-bd21-3e2c1b5f7ea7"
        alt="mattresses diagram"
        width={900}
        height={522}
        unoptimized
        className="rounded-xl border p-2 shadow"
        // Only using eager loading to avoid layout shift - don't know how to do this with nextjs Image
        // component otherwise, since the parent container should shrink if the Image fits, otherwise
        // the Image should shrink into the max height of the parent.
        loading="eager"
      />
    ),
  },
  {
    title: "ORM",
    href: "https://ameliorate.app/examples/ORM",
    category: "Team decision",
    text: "Determine which tool to use for a project. Ameliorate is great at visualizing many options and their tradeoffs.",
    complexity: 3,
    image: (
      <Image
        key="https://github.com/user-attachments/assets/cd390214-da00-4ad3-bb88-4234124ec17b"
        src="https://github.com/user-attachments/assets/cd390214-da00-4ad3-bb88-4234124ec17b"
        alt="ORM diagram"
        width={735}
        height={688}
        unoptimized
        className="rounded-xl border p-2 shadow"
        // Only using eager loading to avoid layout shift - don't know how to do this with nextjs Image
        // component otherwise, since the parent container should shrink if the Image fits, otherwise
        // the Image should shrink into the max height of the parent.
        loading="eager"
      />
    ),
  },
  {
    title: "cars-going-too-fast",
    href: "https://ameliorate.app/examples/detailed-cars-going-too-fast",
    category: "Local policy",
    text: "Work with local government to improve neighborhood safety. Ameliorate can help keep track of various causes & effects, and scoring allows you to call out what you think matters.",
    complexity: 3,
    image: (
      <Image
        key="https://github.com/user-attachments/assets/87b1b0b8-3536-4c77-aa4a-d892f4ed4e6e"
        src="https://github.com/user-attachments/assets/87b1b0b8-3536-4c77-aa4a-d892f4ed4e6e"
        alt="cars-going-too-fast diagram"
        width={648}
        height={783}
        unoptimized
        className="rounded-xl border shadow"
        // Only using eager loading to avoid layout shift - don't know how to do this with nextjs Image
        // component otherwise, since the parent container should shrink if the Image fits, otherwise
        // the Image should shrink into the max height of the parent.
        loading="eager"
      />
    ),
  },
  {
    title: "10-percent-time",
    href: "https://ameliorate.app/keyserj/10-percent-time",
    category: "Org decision",
    text: "Discuss a proposal for a change in process. Ameliorate is well-suited for visualizing proposals that have a few pieces, causes, and effects to consider.",
    complexity: 3,
    image: (
      <Image
        key="https://github.com/user-attachments/assets/753b5c92-4bdd-43dc-840d-37dd70b8f904"
        src="https://github.com/user-attachments/assets/753b5c92-4bdd-43dc-840d-37dd70b8f904"
        alt="10-percent-time diagram"
        width={811}
        height={756}
        unoptimized
        className="rounded-xl border shadow"
        // Only using eager loading to avoid layout shift - don't know how to do this with nextjs Image
        // component otherwise, since the parent container should shrink if the Image fits, otherwise
        // the Image should shrink into the max height of the parent.
        loading="eager"
      />
    ),
  },
  {
    title: "sb74-free-school-meals",
    href: "https://ameliorate.app/keyserj/fl-2025-sb74-free-school-breakfast-lunch",
    category: "State policy",
    text: "Critique and improve school legislation. Ameliorate is well-suited for visualizing proposals that have a few pieces, causes, and effects to consider.",
    complexity: 4,
    image: (
      <Image
        key="https://github.com/user-attachments/assets/23e0d83b-a716-4454-8ef6-2c37c106df82"
        src="https://github.com/user-attachments/assets/23e0d83b-a716-4454-8ef6-2c37c106df82"
        alt="free-school-meals diagram"
        width={787}
        height={739}
        unoptimized
        className="rounded-xl border shadow"
        // Only using eager loading to avoid layout shift - don't know how to do this with nextjs Image
        // component otherwise, since the parent container should shrink if the Image fits, otherwise
        // the Image should shrink into the max height of the parent.
        loading="eager"
      />
    ),
  },
  {
    title: "mta-congestion-tax",
    href: "https://ameliorate.app/keyserj/mta-congestion-pricing",
    category: "Big city policy",
    text: "Critique and improve transit legislation. Ameliorate is well-suited for visualizing proposals that have a few pieces, causes, and effects to consider.",
    complexity: 5,
    image: (
      <Image
        key="https://github.com/user-attachments/assets/fe036a09-6c16-409d-bdf1-6ddf8b828559"
        src="https://github.com/user-attachments/assets/fe036a09-6c16-409d-bdf1-6ddf8b828559"
        alt="mta-congestion-tax diagram"
        width={638}
        height={794}
        unoptimized
        className="rounded-xl border shadow"
        // Only using eager loading to avoid layout shift - don't know how to do this with nextjs Image
        // component otherwise, since the parent container should shrink if the Image fits, otherwise
        // the Image should shrink into the max height of the parent.
        loading="eager"
      />
    ),
  },
  {
    title: "california-wildfires",
    href: "https://ameliorate.app/keyserj/california-wildfire-season-worsening",
    category: "Advocacy",
    text: (
      <span>
        Raise awareness & motivate change. Ameliorate is good for considering the high-level of
        complex problems, but as you add a lot of detail, you may feel that some{" "}
        <Link
          href="https://github.com/amelioro/ameliorate/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22for%20large%20topics%22%2Cwicked%20"
          target="_blank"
        >
          features
        </Link>{" "}
        are missing.
      </span>
    ),
    complexity: 7,
    image: (
      <Image
        key="https://github.com/user-attachments/assets/e8d52795-5a9e-46c8-a8c8-781026eb7426"
        src="https://github.com/user-attachments/assets/e8d52795-5a9e-46c8-a8c8-781026eb7426"
        alt="california-wildfires diagram"
        width={569}
        height={805}
        unoptimized
        className="rounded-xl border shadow"
        // Only using eager loading to avoid layout shift - don't know how to do this with nextjs Image
        // component otherwise, since the parent container should shrink if the Image fits, otherwise
        // the Image should shrink into the max height of the parent.
        loading="eager"
      />
    ),
  },
  {
    title: "climate-change",
    href: "https://ameliorate.app/examples/climate-change",
    category: "Global issue",
    text: (
      <span>
        Grasp and consider an overwhelming problem. Like with other high-complexity issues,
        Ameliorate can help with considering the high-level, but additional{" "}
        <Link
          href="https://github.com/amelioro/ameliorate/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22for%20large%20topics%22%2Cwicked%20"
          target="_blank"
        >
          features
        </Link>{" "}
        are even more desirable for global issues.
      </span>
    ),
    complexity: 10,
    image: (
      <Image
        key="https://github.com/user-attachments/assets/63698108-8e9a-4b02-be79-c509015b96df"
        src="https://github.com/user-attachments/assets/63698108-8e9a-4b02-be79-c509015b96df"
        alt="climate-change diagram"
        width={718}
        height={651}
        unoptimized
        className="rounded-xl border shadow"
        // Only using eager loading to avoid layout shift - don't know how to do this with nextjs Image
        // component otherwise, since the parent container should shrink if the Image fits, otherwise
        // the Image should shrink into the max height of the parent.
        loading="eager"
      />
    ),
  },
] as const satisfies Example[];

const scrollTabToCenter = (tab: HTMLElement) => {
  const tabScrollContainer = tab.offsetParent;
  if (tabScrollContainer === null) return;

  // see this commit's PR for an image explaining this calculation
  const scrollLeft = tab.offsetLeft - (tabScrollContainer.clientWidth - tab.clientWidth) / 2;
  tabScrollContainer.scrollTo({ left: scrollLeft, behavior: "smooth" });
};

type ExampleTab = (typeof examples)[number]["category"];
const initialSelectedTab: ExampleTab = "State policy";

export const ExamplesSection = () => {
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<ExampleTab>(initialSelectedTab);

  const initialTabRef = useRef<HTMLDivElement>(null);

  // center the initial tab on load
  useEffect(() => {
    const initialTab = initialTabRef.current;
    if (!initialTab) return;
    scrollTabToCenter(initialTab);
  }, []);

  // There's some complexity with sizing here because of a few desired requirements related to the image:
  // 1. Want the parent section to shrink to fit the current image if the image is smaller
  // 2. Want the current image to shrink (while maintaining aspect ratio) to the parent section's max height if the image is too big
  // 3. Want to avoid layout shift from loading the image (nextjs Image does this normally but not when image height & width are overridden, which is being done to address requirements 1 & 2)
  // 4. Want to lazy load images so that big bundle isn't loaded all at once (~600kb for all 8 images)
  // 5. Want to ensure images aren't reloaded when switching tabs
  // TODO: currently we're sacrificing req 4 here in order to satisfy the others; ideally we'd find a solution that meets all these reqs without sacrifice.
  return (
    <div className="flex h-full flex-col text-center">
      <Typography variant="h4">See the potential</Typography>

      <TabContext value={selectedCategoryTab}>
        <TabList
          // for some reason without this, the tabs' icons don't take up space
          className="shrink-0"
          variant="scrollable"
          // only using this because tapping a partially-overflowing tab will scroll it flush with the container edge,
          // making it seem like there aren't other tabs. should remove if centering the active tab is made to work, see https://github.com/mui/material-ui/issues/22319#issuecomment-2722511669
          allowScrollButtonsMobile={true}
          // these can auto-show too but using `auto` results in layout shift when scroll buttons are determined to be on
          scrollButtons={true}
          onChange={(_, value: ExampleTab) => setSelectedCategoryTab(value)}
        >
          {examples.map((example) => (
            <Tab
              // need this ref to manually scroll the active tab to center on load
              ref={example.category === initialSelectedTab ? initialTabRef : undefined}
              key={example.category}
              value={example.category}
              label={example.category}
              onClick={(event) => scrollTabToCenter(event.currentTarget)}
              iconPosition="bottom"
              icon={
                <Rating
                  value={example.complexity / 2}
                  precision={0.5}
                  readOnly
                  size="small"
                  icon={<EmojiObjects fontSize="inherit" />}
                  emptyIcon={<EmojiObjectsOutlined fontSize="inherit" />}
                  className="[&_.MuiRating-iconFilled]:text-primary-main"
                />
              }
            />
          ))}
        </TabList>

        {examples.map((example) => (
          <TabPanel
            key={example.category}
            // Using `selectedCategoryTab` here instead of `example.category` is a hack to keep the panels all mounted, so that
            // the images don't have to reload every time a tab is clicked.
            // TODO: after mui v6 upgrade, instead of this hack, can use `keepMounted` https://github.com/mui/material-ui/issues/37398
            value={selectedCategoryTab}
            className={
              "p-0" +
              // `hidden` is specified only because the hack above prevents the panels from knowing when they should be hidden
              (selectedCategoryTab === example.category ? " flex min-h-0 flex-col" : " hidden")
            }
          >
            <Typography variant="body1" className="mt-3">
              {example.text}
            </Typography>

            {/* Want the parent section to shrink to fit this image if the image is smaller, otherwise */}
            {/* respect the parent's max height and maintain the image aspect ratio. */}
            <div className="mt-1 flex min-h-0 flex-col items-center gap-2 [&_>_img]:size-auto [&_>_img]:max-h-full">
              {example.image}
            </div>

            <Typography variant="body2" className="mt-2">
              See in the app:{" "}
              <Link href={example.href} target="_blank">
                {example.title}
              </Link>
            </Typography>
          </TabPanel>
        ))}
      </TabContext>
    </div>
  );
};
