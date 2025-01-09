import { OpenInNew } from "@mui/icons-material";
import { Button, Typography } from "@mui/material";
import Image from "next/image";

import { Link } from "@/web/common/components/Link";

const RotatingDescriptors = () => {
  return (
    <>
      {/* use `hideThird` with a delay to show only one of the 3 texts for each 3s interval of the 9s */}
      {/* use `left-0` and `w-full` for mobile because text-align center doesn't otherwise work with absolute positioning https://stackoverflow.com/a/18148018 */}
      <span className="invisible absolute left-0 w-full animate-[slideInOut_3s_infinite,_hideThird_9s_0s_infinite] text-primary-main sm:left-auto">
        effectively
      </span>
      <span className="invisible absolute left-0 w-full animate-[slideInOut_3s_infinite,_hideThird_9s_3s_infinite] text-primary-main sm:left-auto">
        collaboratively
      </span>
      <span className="invisible absolute left-0 w-full animate-[slideInOut_3s_infinite,_hideThird_9s_6s_infinite] text-primary-main sm:left-auto">
        with an open mind
      </span>

      {/*
        size the text space to the largest of the lines (a line's worth except for small screen + big font),
        while allowing the rotating words to be absolute and appear in the same spot as each other
      */}
      <span className="invisible left-0 w-full text-transparent sm:left-auto">
        with an open mind
      </span>
    </>
  );
};

export const Headline = () => {
  return (
    <div className="relative flex w-full justify-center sm:justify-normal">
      <Image
        src="https://github.com/user-attachments/assets/f61c41ef-0bde-4e03-9a98-98d12695f9d8"
        alt="cars-going-too-fast topic"
        width={1491}
        height={911}
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
      <div className="relative my-24 flex max-w-lg flex-col gap-4 rounded-3xl bg-paperPlain-main text-center sm:my-32 sm:border sm:border-primary-main sm:p-8 sm:text-left sm:shadow-xl">
        <Typography variant="h1" fontWeight="bold" className="text-4xl sm:text-5xl">
          Analyze problems
          <br />
          <RotatingDescriptors />
        </Typography>

        <Typography variant="body1">
          Gain traction on tackling <b>any</b> problem.
        </Typography>

        <Typography variant="body1" className="-mt-1">
          <span className="font-bold text-primary-main">Ameliorate</span> provides a structure to
          help you visualize all details and perspectives relevant to a problem, so that it's easier
          to <b>grasp the problem</b>, <b>understand each other</b>, and ultimately{" "}
          <b>make better decisions</b>.
        </Typography>

        <div className="flex flex-wrap items-center justify-center gap-2 *:shrink-0 sm:justify-normal">
          <Button variant="contained" LinkComponent={Link} href="/new">
            Start Building
          </Button>
          <Button variant="outlined" LinkComponent={Link} href="/playground">
            Play Around
          </Button>
          <Button
            variant="text"
            LinkComponent={Link}
            href="https://www.youtube.com/watch?v=eC-Xs5ec90Q"
            target="_blank"
            endIcon={<OpenInNew />}
          >
            See Demo
          </Button>
        </div>
      </div>
    </div>
  );
};
