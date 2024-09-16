import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  console.log("middleware running");

  // log when we're handling a request, but filter out _next requests because we mostly care about fetches
  // this is intended to aid with debugging requests, since it seems that netlify functions don't automatically log request URLs
  if (!request.nextUrl.pathname.startsWith("/_next")) {
    console.info("[request]", request.nextUrl.pathname);
  }
}
