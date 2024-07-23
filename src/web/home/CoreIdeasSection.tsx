import { Typography } from "@mui/material";
import Image from "next/image";
import { useState } from "react";

import { Link } from "@/web/common/components/Link";
import { Card } from "@/web/home/Card";

export const CoreIdeasSection = () => {
  const [selectedCard, setSelectedCard] = useState<"diagram" | "details">("diagram");

  const cards = (
    <>
      <Card
        title="Build a diagram"
        description="Break down problems and solutions into parts that can be considered individually, or together."
        onClick={() => setSelectedCard("diagram")}
        selected={selectedCard === "diagram"}
      />
      <Card
        title="Add nuance"
        description="For any individual part of the diagram, add things like how important you think it is and why, or questions that would be good to answer."
        onClick={() => setSelectedCard("details")}
        selected={selectedCard === "details"}
      />
    </>
  );

  const carouselItems = (
    <>
      <div className={selectedCard === "diagram" ? "" : "hidden"}>
        <Image
          src="https://github.com/user-attachments/assets/95b6c4cb-1f5f-4885-8012-bf92bda308d1"
          alt="climate change and congestion pricing topics"
          width={1970}
          height={1650}
          priority={true}
        />
        <Typography variant="caption">
          Top-right:{" "}
          <Link
            href="https://ameliorate.app/examples/climate-change?view=Causes+and+concerns"
            target="_blank"
          >
            climate-change
          </Link>
          , bottom-left:{" "}
          <Link
            href="https://ameliorate.app/keyserj/mta-congestion-pricing?view=Good+about+Solution"
            target="_blank"
          >
            mta-congestion-pricing
          </Link>
        </Typography>
      </div>
      <div className={selectedCard === "details" ? "" : "hidden"}>
        <Image
          src="https://github.com/user-attachments/assets/32c8f820-4e04-4cd3-91ce-231da60a0ab8"
          alt="cars going too fast topic"
          width={707}
          height={519}
        />
        <Typography variant="caption">
          Indicators on the bottom-right of a part convey which kinds of details are associated with
          it. Scores convey how important you think a part is. Images from{" "}
          <Link
            href="https://ameliorate.app/examples/detailed-cars-going-too-fast?view=All+with+problem+selected"
            target="_blank"
          >
            cars-going-too-fast
          </Link>
          .
        </Typography>
      </div>
    </>
  );

  return (
    <div className="flex flex-col text-center">
      <Typography variant="h4">Break things down</Typography>
      <Typography variant="body1">
        Check out{" "}
        <Link href="https://ameliorate.app/docs/getting-started" target="_blank">
          Getting Started
        </Link>{" "}
        for a more detailed explanation of the core ideas.
      </Typography>

      <div className="mt-2 hidden grid-cols-3 items-center gap-3 sm:grid">
        <div className="flex flex-col gap-2 text-start">{cards}</div>
        {/* aspect ratio to keep different-sized images from jumping around */}
        <div className="col-span-2 flex aspect-[19/18] items-center lg:aspect-[19/17]">
          {carouselItems}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:hidden">
        <div className="flex h-48 overflow-x-auto text-start *:w-56 *:shrink-0">{cards}</div>
        <div className="flex">{carouselItems}</div>
      </div>
    </div>
  );
};
