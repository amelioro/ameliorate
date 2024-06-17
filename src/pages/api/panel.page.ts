import type { NextApiRequest, NextApiResponse } from "next";
import { renderTrpcPanel } from "trpc-panel";

import { appRouter } from "@/api/routers/_app";
import { getBaseUrl } from "@/common/utils";

export default function handler(_: NextApiRequest, res: NextApiResponse) {
  res.status(200).send(
    renderTrpcPanel(appRouter, {
      url: `${getBaseUrl()}/api/trpc`,
      transformer: "superjson",
    }),
  );
}
