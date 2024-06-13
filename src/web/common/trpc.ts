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
          url: `${getBaseUrl()}/api/trpc`,

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
