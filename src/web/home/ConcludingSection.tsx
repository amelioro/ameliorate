import { Button, Typography } from "@mui/material";

import { Link } from "@/web/common/components/Link";

export const ConcludingSection = () => {
  return (
    <div className="flex justify-center">
      <div className="my-8 flex max-w-lg flex-col items-center gap-4 text-center">
        {/* font-size to ensure each line of slogan fits on its own line */}
        <div className="*:text-3xl sm:*:text-4xl">
          <Typography variant="h4">Understand ourselves.</Typography>
          <Typography variant="h4">Understand each other.</Typography>
          <Typography variant="h4" className="text-primary-main">
            Grow together.
          </Typography>
        </div>

        <div className="flex justify-center gap-2 pt-2 sm:justify-normal">
          <Button variant="contained" LinkComponent={Link} href="/new">
            Create Topic
          </Button>
          <Button variant="outlined" LinkComponent={Link} href="/playground">
            Play Around
          </Button>
        </div>
      </div>
    </div>
  );
};
