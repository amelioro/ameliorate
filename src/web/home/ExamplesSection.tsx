import { EmojiObjects, EmojiObjectsOutlined } from "@mui/icons-material";
import { Divider, Rating, Slider, Typography } from "@mui/material";
import Image from "next/image";
import { useRef, useState } from "react";

import { throwError } from "@/common/errorHandling";
import Carousel from "@/web/common/components/Carousel";
import { Link } from "@/web/common/components/Link";

interface Example {
  title: string;
  href: string;
  category: string;
  purpose: string;
  complexity: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  complexityDescription: string;
  /**
   * 0-100, translating complexity but keeping it unique so slider marks don't overlap
   */
  sliderValue: number;
  notes: string;
  image: JSX.Element;
}

const examples: Example[] = [
  {
    title: "mattresses",
    href: "https://ameliorate.app/keyserj/mattresses",
    category: "Personal decision",
    purpose: "determine which mattress to purchase",
    complexity: 2,
    complexityDescription: "some options, some tradeoffs, small scope",
    sliderValue: 10,
    notes: "Ameliorate is great at visualizing many options and their tradeoffs.",
    image: (
      <Image
        key="https://github.com/user-attachments/assets/e2f7f706-a9d4-4cee-bd21-3e2c1b5f7ea7"
        src="https://github.com/user-attachments/assets/e2f7f706-a9d4-4cee-bd21-3e2c1b5f7ea7"
        alt="mattresses diagram"
        width={900}
        height={522}
        unoptimized
        className="rounded-xl border p-2 shadow"
      />
    ),
  },
  {
    title: "ORM",
    href: "https://ameliorate.app/examples/ORM",
    category: "Team decision",
    purpose: "determine which tool to use for a project",
    complexity: 3,
    complexityDescription: "lots of options and tradeoffs, small scope",
    sliderValue: 20,
    notes: "Ameliorate is great at visualizing many options and their tradeoffs.",
    image: (
      <Image
        key="https://github.com/user-attachments/assets/bb0c19f7-191e-4b9e-bc15-f21557fdc8a5"
        src="https://github.com/user-attachments/assets/bb0c19f7-191e-4b9e-bc15-f21557fdc8a5"
        alt="ORM diagram"
        width={777}
        height={690}
        unoptimized
        className="rounded-xl border shadow"
      />
    ),
  },
  {
    title: "cars-going-too-fast",
    href: "https://ameliorate.app/examples/detailed-cars-going-too-fast",
    category: "Local policy",
    // purpose: "work with local gov't to improve neighborhood safety",
    purpose: "work with local gov't to improve safety",
    // purpose: "figure out how to best improve neighborhood safety",
    complexity: 3,
    complexityDescription: "some causes/effects, some options, small scope",
    sliderValue: 25,
    notes:
      "Ameliorate can help keep track of various causes & effects, and scoring allows you to call out what you think matters.",
    image: (
      <Image
        key="https://github.com/user-attachments/assets/87b1b0b8-3536-4c77-aa4a-d892f4ed4e6e"
        src="https://github.com/user-attachments/assets/87b1b0b8-3536-4c77-aa4a-d892f4ed4e6e"
        alt="cars-going-too-fast diagram"
        width={648}
        height={783}
        unoptimized
        className="rounded-xl border shadow"
      />
    ),
  },
  {
    title: "10-percent-time",
    href: "https://ameliorate.app/keyserj/10-percent-time",
    // category: "Organization decision",
    category: "Org decision",
    purpose: "evaluate proposal for a change in process",
    complexity: 3,
    complexityDescription: "some pieces some causes/effects small scope",
    sliderValue: 30,
    notes:
      "Ameliorate is well-suited for visualizing proposals that have a few pieces, causes, and effects to consider.",
    image: (
      <Image
        key="https://github.com/user-attachments/assets/753b5c92-4bdd-43dc-840d-37dd70b8f904"
        src="https://github.com/user-attachments/assets/753b5c92-4bdd-43dc-840d-37dd70b8f904"
        alt="10-percent-time diagram"
        width={811}
        height={756}
        unoptimized
        className="rounded-xl border shadow"
      />
    ),
  },
  {
    title: "sb74-free-school-meals",
    href: "https://ameliorate.app/keyserj/fl-2025-sb74-free-school-breakfast-lunch",
    category: "State policy",
    purpose: "critique & improve school legislation",
    complexity: 4,
    complexityDescription: "some pieces some causes/effects medium scope",
    sliderValue: 40,
    notes:
      "Ameliorate is well-suited for visualizing proposals that have a few pieces, causes, and effects to consider.",
    image: (
      <Image
        key="https://github.com/user-attachments/assets/23e0d83b-a716-4454-8ef6-2c37c106df82"
        src="https://github.com/user-attachments/assets/23e0d83b-a716-4454-8ef6-2c37c106df82"
        alt="free-school-meals diagram"
        width={787}
        height={739}
        unoptimized
        className="rounded-xl border shadow"
      />
    ),
  },
  {
    title: "mta-congestion-tax",
    href: "https://ameliorate.app/keyserj/mta-congestion-pricing",
    category: "Big city policy",
    purpose: "critique & improve transit legislation",
    complexity: 5,
    complexityDescription: "some pieces, some causes/effects, many groups involved",
    sliderValue: 50,
    notes:
      "Ameliorate is well-suited for visualizing proposals that have a few pieces, causes, and effects to consider.",
    image: (
      <Image
        key="https://github.com/user-attachments/assets/fe036a09-6c16-409d-bdf1-6ddf8b828559"
        src="https://github.com/user-attachments/assets/fe036a09-6c16-409d-bdf1-6ddf8b828559"
        alt="mta-congestion-tax diagram"
        width={638}
        height={794}
        unoptimized
        className="rounded-xl border shadow"
      />
    ),
  },
  {
    title: "california-wildfires",
    href: "https://ameliorate.app/keyserj/california-wildfire-season-worsening",
    category: "Advocacy",
    purpose: "raise awareness & motivate change",
    complexity: 7,
    complexityDescription: "many pieces, many causes/effects, many groups involved",
    sliderValue: 70,
    notes:
      "Ameliorate is good for considering the high-level of complex problems, but as you add a lot of detail, you'll likely feel that some [features] are missing.",
    image: (
      <Image
        key="https://github.com/user-attachments/assets/e8d52795-5a9e-46c8-a8c8-781026eb7426"
        src="https://github.com/user-attachments/assets/e8d52795-5a9e-46c8-a8c8-781026eb7426"
        alt="california-wildfires diagram"
        width={569}
        height={805}
        unoptimized
        className="rounded-xl border shadow"
      />
    ),
  },
  {
    title: "sugar-brutality",
    href: "https://ameliorate.app/keyserj/brutality-sugar-article",
    category: "Advocacy",
    purpose: "raise awareness & motivate change",
    complexity: 8,
    complexityDescription: "many pieces, many intertwined causes/effects, many groups involved",
    sliderValue: 80,
    notes:
      "Ameliorate is good for considering the high-level of complex problems, but as you add a lot of detail, you'll likely feel that some [features] are missing.",
    image: (
      <Image
        key="https://github.com/user-attachments/assets/62732e0e-494d-4767-a2ae-09b7056b6c7a"
        src="https://github.com/user-attachments/assets/62732e0e-494d-4767-a2ae-09b7056b6c7a"
        alt="sugar-brutality diagram"
        width={714}
        height={672}
        unoptimized
        className="rounded-xl border shadow"
      />
    ),
  },
  {
    title: "climate-change",
    href: "https://ameliorate.app/examples/climate-change",
    category: "Global issue",
    purpose: "grasp & consider an overwhelming problem",
    complexity: 10,
    complexityDescription: "many many causes/effects, many many groups involved",
    sliderValue: 90,
    notes:
      "Global issues are tough. Like with other high-complexity issues, Ameliorate can help with considering the high-level, but even more [features] are desirable.",
    image: (
      <Image
        key="https://github.com/user-attachments/assets/63698108-8e9a-4b02-be79-c509015b96df"
        src="https://github.com/user-attachments/assets/63698108-8e9a-4b02-be79-c509015b96df"
        alt="climate-change diagram"
        width={718}
        height={651}
        unoptimized
        className="rounded-xl border shadow"
      />
    ),
  },
];

const initialSlideIndex = 3;

export const ExamplesSection = () => {
  const [currentExampleIndex, setCurrentExampleIndex] = useState(initialSlideIndex);
  const carouselRef = useRef<Carousel>(null);

  const currentExample = examples[currentExampleIndex];

  if (!currentExample)
    return throwError(`No example found for index ${currentExampleIndex}`, examples);

  return (
    // <div className="flex flex-col rounded-xl  bg-gradient-to-b from-white to-gray-200 p-4 text-center">
    <div className="flex h-full min-h-0 flex-col rounded-xl text-center">
      <Typography variant="h4">See the potential</Typography>
      {/* <Typography variant="body1">Examples by complexity</Typography> */}

      <Carousel
        ref={carouselRef}
        // dots={true}
        arrows={false}
        centerMode={true}
        // slidesToShow={3}
        slidesToScroll={1}
        initialSlide={initialSlideIndex}
        focusOnSelect={true}
        variableWidth={true}
        infinite={false}
        beforeChange={(_current, next) => setCurrentExampleIndex(next)}
        className={
          // "mx-6 mb-8 mt-3 w-screen -translate-x-1/2 relative left-1/2 !m-0" +
          // "mx-6 mb-8 !mt-0 w-screen -translate-x-1/2 relative left-1/2 !m-0" +
          "w-screen -translate-x-1/2 relative left-1/2 !m-0" +
          // "w-full -translate-x-1/2 relative left-1/2 !m-0" +
          // "w-[100dvw] -translate-x-1/2 relative left-1/2 !m-0" +
          // "inset-x-0 relative !m-0" +
          " [&_.slick-next:before]:text-black [&_.slick-prev:before]:text-black" +
          // " [&_.slick-slide]:py-4 [&_.slick-slide]:px-2"
          " [&_.slick-slide]:py-1 [&_.slick-slide]:px-2 [&_.slick-slide]:max-w-[100vw] [&_.slick-slide]:!h-auto" +
          " [&_.slick-slide_>_*]:h-full [&_.slick-slide_>_*]:flex [&_.slick-slide_>_*]:justify-stretch" +
          // for some reason the track will go into two rows (even with rows={1}) without `flex`
          // " [&_.slick-track]:flex [&_.slick-track]:items-stretch"
          " [&_.slick-track]:flex [&_.slick-track]:justify-stretch"
        }
      >
        {examples.map((example, index) => (
          <div
            key={example.title}
            role="button"
            className={
              // "flex !size-56 flex-col rounded-xl border p-4 text-left" +
              // "flex !w-56 h-40 flex-col rounded-xl border p-4 text-left" +
              // "flex !w-56 h-24 flex-col rounded-xl border p-4 text-left" +
              // "flex !w-56 flex-col rounded-xl border p-4 text-left" +
              // "flex !w-76 flex-col rounded-xl border p-4 text-left" +
              "flex flex-col rounded-xl h-full border p-4 text-left max-w-full whitespace-nowrap" +
              (index === currentExampleIndex
                ? " border-primary-main bg-primary-light/5 hover:cursor-auto"
                : " hover:bg-primary-light/5 hover:cursor-pointer")
            }
          >
            {/* <Typography variant="body2" className="opacity-40"> */}
            <div className="flex flex-wrap items-center justify-between">
              <Typography variant="h5" className="pr-2">
                {example.category}
              </Typography>
              {/* <Typography variant="body2"> */}
              {/* <Typography variant="body2"> */}
              {/* <b>Complexity</b>: */}
              {/* Complexity: */}
              {/* </Typography> */}
              <Rating
                value={example.complexity / 2}
                precision={0.5}
                readOnly
                size="small"
                // icon={<Lightbulb />}
                // emptyIcon={<LightbulbOutlined />}
                // icon={<Camera />}
                // emptyIcon={<Camera />}
                // icon={<Camera />}
                // emptyIcon={<CameraOutlined />}
                icon={<EmojiObjects fontSize="inherit" />}
                emptyIcon={<EmojiObjectsOutlined fontSize="inherit" />}
                // className="[&_.MuiRating-iconFilled]:text-info-main"
                className="[&_.MuiRating-iconFilled]:text-primary-main"
                // className="[&_.MuiRating-iconFilled]:text-purple-400"
                // className="[&_.MuiRating-iconFilled]:text-problem-main"
                // className="[&_.MuiRating-iconFilled]:text-yellow-500"
              />
            </div>
            {/* </Typography> */}

            <Divider className="my-2" />

            {/* <Typography variant="h6"> */}
            <Typography variant="body2" className="mt-1">
              {/* <Typography variant="body2" className=""> */}
              {/* <b>Example</b>:{" "} */}
              <Link href={example.href} target="_blank">
                {example.title}
              </Link>
            </Typography>

            <Typography variant="body2">
              {/* <b>Purpose</b>:{" "} */}
              {example.purpose}
            </Typography>
            {/* <Typography variant="body2">Notes: {example.notes}</Typography> */}
          </div>
        ))}
      </Carousel>

      {/* <TabContext value="3">
        <TabList className="shrink-0" variant="scrollable">
          {examples.map((example, index) => (
            <Tab
              key={example.title}
              value={index.toString()}
              label={example.category}
              // icon={<Camera />}
              // iconPosition="bottom"
              icon={
                <Rating
                  value={example.complexity / 2}
                  precision={0.5}
                  readOnly
                  size="small"
                  // icon={<Lightbulb />}
                  // emptyIcon={<LightbulbOutlined />}
                  // icon={<Camera />}
                  // emptyIcon={<Camera />}
                  // icon={<Camera />}
                  // emptyIcon={<CameraOutlined />}
                  icon={<EmojiObjects fontSize="inherit" />}
                  emptyIcon={<EmojiObjectsOutlined fontSize="inherit" />}
                  // className="[&_.MuiRating-iconFilled]:text-info-main"
                  className="[&_.MuiRating-iconFilled]:text-primary-main"
                  // className="[&_.MuiRating-iconFilled]:text-purple-400"
                  // className="[&_.MuiRating-iconFilled]:text-problem-main"
                  // className="[&_.MuiRating-iconFilled]:text-yellow-500"
                />
              }
            />
          ))}
        </TabList>
      </TabContext> */}

      <div className="flex items-center justify-center gap-2">
        <Typography variant="body2">Complexity</Typography>
        <Slider
          aria-label="Examples slider"
          value={currentExample.sliderValue}
          onChange={(_event, value) => {
            const index = examples.findIndex((example) => example.sliderValue === value);
            if (index === -1)
              return throwError(`No example found for value ${value.toString()}`, examples);
            setCurrentExampleIndex(index);
            carouselRef.current?.slickGoTo(index);
          }}
          marks={examples.map((example) => ({ value: example.sliderValue }))}
          track={false}
          step={null}
          size="small"
          // valueLabelFormat={(value) => marks.find((mark) => mark.value === value)?.text}
          // valueLabelDisplay="auto"
          valueLabelDisplay="off"
          // className="w-4/5"
          className="max-w-72 self-center [&_>_.MuiSlider-mark]:h-2"
        />
      </div>

      {/* <Divider className="my-1 border border-primary-light" /> */}

      {/* <Typography variant="body1" className="mt-1">
        {currentExample.purpose}. {currentExample.notes}
      </Typography> */}

      {/* <div className="mt-2 flex min-h-0 shrink flex-col items-center gap-2 [&_>_img]:size-auto [&_>_img]:max-h-full"> */}
      <div className="mt-1 flex min-h-0 shrink flex-col items-center gap-2 [&_>_img]:size-auto [&_>_img]:max-h-full">
        {/* <div className="flex min-h-0 shrink flex-col items-center gap-2 *:shrink"> */}
        {/* <div className="flex flex-col items-center gap-2 [&_>_img]:!h-auto"> */}
        {/* <div className="flex min-h-0 flex-col items-center gap-2 *:min-h-0 *:shrink"> */}
        {currentExample.image}
      </div>
    </div>
  );
};
