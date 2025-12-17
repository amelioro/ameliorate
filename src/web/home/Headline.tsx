import { OpenInNew } from "@mui/icons-material";
import { Button, Typography } from "@mui/material";
import Image from "next/image";

import { Link } from "@/web/common/components/Link";

export const Headline = () => {
  return (
    // height set so that next section is _just_ visible, regardless of screen height (8svh to show part of next section, 96px for header and banner, 4rem for padding)
    <div className="relative flex h-[calc(100svh-8svh-96px-4rem)] w-full justify-center sm:justify-normal">
      <Image
        src="https://github.com/user-attachments/assets/f61c41ef-0bde-4e03-9a98-98d12695f9d8"
        alt="cars-going-too-fast topic"
        width={1491}
        height={911}
        priority={true}
        className="absolute hidden opacity-30 sm:block"
      />
      <Typography variant="caption" className="absolute top-0 right-0 hidden sm:block">
        Background:{" "}
        <Link
          href="https://ameliorate.app/examples/detailed-cars-going-too-fast?view=All+structure"
          target="_blank"
        >
          cars-going-too-fast
        </Link>
      </Typography>
      {/* max-w-xl to have a decent amount of space to the right to show the background image (on most screens) */}
      <div className="relative flex max-w-xl flex-col self-center rounded-3xl bg-paperPlain-main text-center sm:border sm:border-primary-main sm:p-8 sm:text-left sm:shadow-xl">
        <Typography component="h1" className="self-center text-3xl font-bold sm:self-start">
          What if it was trivial to understand someone's reasoning, and to add yours to it?
        </Typography>

        <Typography variant="body2" className="text-xs sm:mt-1">
          <Link href="https://ameliorate.app/docs/mission-vision#vision" target="_blank">
            here's what the world could look like
          </Link>
        </Typography>

        <Typography variant="body1" className="mt-5 sm:mt-3">
          <span className="font-bold underline decoration-primary-main decoration-2">
            Ameliorate
          </span>{" "}
          aims to make this a reality. It proposes{" "}
          <Link href="#break-things-down">a way of breaking down problems</Link> that's particularly
          built for collaborative refinement, and provides <Link href="#features">tooling</Link> for
          navigating and working with that information.
        </Typography>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 *:shrink-0 sm:justify-normal">
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
