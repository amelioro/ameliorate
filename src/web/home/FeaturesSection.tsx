import { Link, Typography } from "@mui/material";
import Image from "next/image";
import { useState } from "react";

import { Card } from "@/web/home/Card";

export const FeaturesSection = () => {
  const [selectedCard, setSelectedCard] = useState<
    "tradeoffs" | "views" | "flashlight" | "disagree"
  >("tradeoffs");

  const cards = (
    <>
      <Card
        title="Summarize tradeoffs between solutions"
        description="Show how important you think each tradeoff is, and how well each solution fulfills that tradeoff."
        onClick={() => setSelectedCard("tradeoffs")}
        selected={selectedCard === "tradeoffs"}
      />
      <Card
        title="Focus on different aspects"
        description="Create views to highlight specific parts of the diagram."
        onClick={() => setSelectedCard("views")}
        selected={selectedCard === "views"}
      />
      <Card
        title="Move through complex diagrams"
        description="Use flashlight mode to easily explore large diagrams."
        onClick={() => setSelectedCard("flashlight")}
        selected={selectedCard === "flashlight"}
      />
      <Card
        title="Quickly identify where you disagree"
        description="Compare scores to efficiently understand where your opinions lie in relation to others."
        onClick={() => setSelectedCard("disagree")}
        selected={selectedCard === "disagree"}
      />
    </>
  );

  const carouselItems = (
    <>
      <div className={selectedCard === "tradeoffs" ? "" : "hidden"}>
        <Image
          src="https://github.com/user-attachments/assets/6733473d-9122-4199-9e2d-d6d651f4a846"
          alt="criteria tables of cars-going-too-fast and ORM topics"
          width={1221}
          height={787}
        />
        <Typography variant="caption">
          Top-left:{" "}
          <Link
            href="https://ameliorate.app/examples/ORM?view=Tradeoffs+scored+as+important"
            target="_blank"
          >
            ORM
          </Link>
          , bottom-right:{" "}
          <Link
            href="https://ameliorate.app/examples/detailed-cars-going-too-fast?view=Tradeoff+table"
            target="_blank"
          >
            cars-going-too-fast
          </Link>
        </Typography>
      </div>
      <div className={selectedCard === "views" ? "" : "hidden"}>
        <Image
          src="https://github.com/user-attachments/assets/de5d9ebf-1b66-42f7-b1c5-cb0c0f595ee3"
          alt="clicking between views in cars-going-too-fast topic"
          width={1018}
          height={601}
          unoptimized // warning without this - gifs aren't optimized by nextjs apparently
        />
        <Typography variant="caption">
          Topic:{" "}
          <Link href="https://ameliorate.app/examples/detailed-cars-going-too-fast" target="_blank">
            cars-going-too-fast
          </Link>
        </Typography>
      </div>
      <div className={selectedCard === "flashlight" ? "" : "hidden"}>
        <Image
          src="https://github.com/user-attachments/assets/98d75b2b-6ca4-41cd-9322-314c75126232"
          alt="using flashlight mode in brutality-sugar topic"
          width={1022}
          height={728}
          unoptimized // warning without this - gifs aren't optimized by nextjs apparently
        />
        <Typography variant="caption">
          Topic:{" "}
          <Link href="https://ameliorate.app/keyserj/brutality-sugar-article" target="_blank">
            brutality-sugar-article
          </Link>
        </Typography>
      </div>
      <div className={selectedCard === "disagree" ? "" : "hidden"}>
        <Image
          src="https://github.com/user-attachments/assets/c1c9043a-4a0f-4af6-a309-ab3574301054"
          alt="comparing scores in cars-going-too-fast topic"
          width={756}
          height={703}
          unoptimized // warning without this - gifs aren't optimized by nextjs apparently
        />
        <Typography variant="caption">
          Topic:{" "}
          <Link href="https://ameliorate.app/examples/detailed-cars-going-too-fast" target="_blank">
            cars-going-too-fast
          </Link>
        </Typography>
      </div>
    </>
  );

  return (
    <div className="flex flex-col text-center">
      <Typography variant="h4">Organize, navigate, and focus discussion</Typography>
      <Typography variant="body1">
        Check out the{" "}
        <Link href="https://ameliorate.app/docs" target="_blank">
          docs
        </Link>{" "}
        for more features.
      </Typography>

      <div className="mt-2 hidden grid-cols-3 items-center gap-3 sm:grid">
        <div className="flex flex-col gap-2 text-start [&_p]:hidden lg:[&_p]:block">{cards}</div>
        {/* aspect ratio to keep different-sized images from jumping around */}
        <div className="col-span-2 flex aspect-square items-center ">{carouselItems}</div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:hidden">
        <div className="flex h-32 overflow-x-auto text-start *:w-60 *:shrink-0 [&_p]:hidden">
          {cards}
        </div>
        <div className="flex">{carouselItems}</div>
      </div>
    </div>
  );
};
