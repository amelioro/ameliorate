import { Button, Typography } from "@mui/material";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Link } from "@/web/common/components/Link";

const RotatingDescriptors = () => {
  const [indexToShow, setIndexToShow] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIndexToShow((prevIndex) => (prevIndex + 1) % 3);
      // slightly less than the 3s animation duration because it seems like sometimes the animation
      // finishes and starts over before the word changes, flicking the word after its animation finishes
    }, 2800);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <span
        className={`inline-block animate-[shake_3s_1] text-primary-main ${indexToShow !== 0 ? "hidden" : ""}`}
      >
        efficiently
      </span>
      <span
        className={`inline-block animate-[shake_3s_1] text-primary-main ${indexToShow !== 1 ? "hidden" : ""}`}
      >
        precisely
      </span>
      <span
        className={`inline-block animate-[shake_3s_1] text-primary-main ${indexToShow !== 2 ? "hidden" : ""}`}
      >
        open-mindedly
      </span>
    </>
  );
};

export const Headline = () => {
  return (
    <div className="relative flex w-full justify-center sm:justify-normal">
      <Image
        src="https://github.com/user-attachments/assets/e02563a9-c3f2-4d07-89c1-f174f6eeff53"
        alt="cars-going-too-fast topic"
        width={1746}
        height={1846}
        priority={true}
        className="absolute hidden opacity-30 sm:block"
      />
      <Typography variant="caption" className="absolute right-0 top-0 hidden sm:block">
        Background:{" "}
        <Link
          href="https://ameliorate.app/examples/detailed-cars-going-too-fast?view=All+structure"
          target="_blank"
        >
          cars-going-too-fast
        </Link>
      </Typography>
      <div className="relative my-24 flex max-w-lg flex-col gap-4 rounded-3xl bg-paper-main text-center sm:my-32 sm:border sm:border-primary-main sm:p-8 sm:text-left sm:shadow-xl">
        <Typography variant="h1" fontWeight="bold" className="text-4xl sm:text-5xl">
          Analyze problems
          <br />
          <RotatingDescriptors />
        </Typography>

        <Typography variant="body1">
          Thinking through problems doesn't have to be so hard.
        </Typography>

        <Typography variant="body1" className="-mt-1">
          <span className="font-bold text-primary-main">Ameliorate</span> provides a structure to
          help you visualize all details and perspectives relevant to a problem, so that it's easier
          to <b>grasp the problem</b>, <b>understand each other</b>, and ultimately{" "}
          <b>make better decisions</b>.
        </Typography>

        <div className="flex justify-center gap-2 sm:justify-normal">
          <Button variant="contained" LinkComponent={Link} href="/new">
            Start Building
          </Button>
          <Button variant="outlined" LinkComponent={Link} href="/playground">
            Play Around
          </Button>
        </div>
      </div>
    </div>
  );
};
