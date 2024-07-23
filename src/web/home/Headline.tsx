import { Button, Typography } from "@mui/material";
import Image from "next/image";

import { Link } from "@/web/common/components/Link";

export const Headline = () => {
  return (
    <div className="relative flex w-full justify-center sm:justify-normal">
      <Image
        src="https://github.com/user-attachments/assets/5ccacace-fb45-4ac6-b8df-bf7acfbd3b19"
        alt="cars-going-too-fast topic"
        width={1904}
        height={2009}
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
        <Typography variant="h3" fontWeight="bold" className="text-4xl sm:text-5xl">
          <span className="text-primary-main">Visualize</span> your understanding.
        </Typography>
        <Typography variant="body1">
          Thinking about problems can be tricky, but it doesn't have to be.{" "}
          <span className="font-bold text-primary-main">Ameliorate</span> provides a{" "}
          <b>structure</b> to help you break down a problem, along with features for{" "}
          <b>organizing</b>, <b>navigating</b>, and <b>discussing</b> that information, so that it's
          easier to grasp, align with others, and ultimately make better decisions.
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
