import { QueryClient } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import superjson from "superjson";

import type { AppRouter } from "@/api/routers/_app";
import { getBaseUrl } from "@/common/utils";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  },
});

export const trpc = createTRPCNext<AppRouter>({
  config(_opts) {
    return {
      links: [
        httpBatchLink({
          /**
           * If you want to use SSR, you need to use the server's full URL
           * @link https://trpc.io/docs/ssr
           **/
          url: `${getBaseUrl(true)}/api/trpc`,

          // // You can pass any HTTP headers you wish here
          // async headers() {
          //   return {
          //     // authorization: getAuthCookie(),
          //   };
          // },
        }),
      ],
      transformer: superjson,
      queryClient: queryClient,
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   **/
  ssr: false,
});

// jank way to enable trpc queries outside of react tree, e.g. from zustand middleware https://github.com/trpc/trpc/discussions/2926#discussioncomment-5647033
// separate from its assignment so that importers don't need to import from a file with jsx
// using an object so that app.page can set the client after importing
export const trpcHelper = {
  client: null as unknown as ReturnType<typeof trpc.useUtils>["client"],
};
