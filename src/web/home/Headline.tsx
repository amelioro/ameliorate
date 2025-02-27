import { OpenInNew } from "@mui/icons-material";
import { Button, Typography } from "@mui/material";
import Image from "next/image";

import { Link } from "@/web/common/components/Link";

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
      {/* max-w-xl to barely fit the headline on two lines */}
      <div className="relative my-24 flex max-w-xl flex-col gap-4 rounded-3xl bg-paperPlain-main text-center sm:my-32 sm:border sm:border-primary-main sm:p-8 sm:text-left sm:shadow-xl">
        <Typography
          variant="h1"
          fontWeight="bold"
          className="flex self-center border-b-4 border-primary-main pb-1 text-3xl sm:self-start sm:border-b-8 sm:text-5xl"
        >
          Understand problems.
          <br />
          Improve decisions.
        </Typography>

        <Typography variant="body1">
          Tackle problems with confidence, working together to ensure that every detail and
          perspective has been properly considered.
        </Typography>

        <Typography variant="body1" className="-mt-1">
          <span className="font-bold underline decoration-primary-main decoration-2">
            Ameliorate
          </span>{" "}
          helps you <Link href="#break-things-down">break down problems</Link> in a way that's easy
          to understand, refine, and align on, and provides <Link href="#features">tooling</Link>{" "}
          for navigating and working with that information.
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
