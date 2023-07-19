import type { NextApiRequest, NextApiResponse } from "next";
import { renderTrpcPanel } from "trpc-panel";

import { appRouter } from "../../api/routers/_app";

export default function handler(_: NextApiRequest, res: NextApiResponse) {
  res.status(200).send(
    renderTrpcPanel(appRouter, {
      url: `${process.env.DEPLOY_PRIME_URL ?? "http://localhost:3000"}/api/trpc`,
      transformer: "superjson",
    })
  );
}
