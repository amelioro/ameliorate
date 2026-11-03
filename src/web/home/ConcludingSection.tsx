import { Button, Typography } from "@mui/material";

import { Link } from "@/web/common/components/Link";

export const ConcludingSection = () => {
  return (
    <div className="flex justify-center">
      <div className="my-8 flex max-w-lg flex-col items-center gap-4 text-center">
        {/* font-size to ensure each line of slogan fits on its own line */}
        <Typography component="h2" variant="h4" className="text-3xl sm:text-4xl">
          Understand ourselves.
          <br />
          Understand each other.
          <br />
          <span className="text-primary-main">Grow together.</span>
        </Typography>

        <div className="flex justify-center gap-2 pt-2 sm:justify-normal">
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
