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
      <div className="relative my-32 flex max-w-lg flex-col gap-4 rounded-3xl bg-paper-main text-center sm:border sm:border-primary-main sm:p-8 sm:text-left sm:shadow-xl">
        <Typography variant="h3" fontWeight="bold" className="text-4xl sm:text-5xl">
          <span className="text-primary-main">Mutually understand</span> tough problems.
        </Typography>
        <Typography variant="body1">
          <span className="font-bold text-primary-main">Ameliorate</span> provides a{" "}
          <b>structure</b> for representing how you understand problems and solutions, as well as
          features for <b>organizing</b>, <b>navigating</b>, and <b>discussing</b> that information,
          so that you can convey the nuance of your thoughts with accuracy and with ease.
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
