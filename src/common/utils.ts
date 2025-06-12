import { isEqual } from "es-toolkit";

/**
 * @param allowRelative motivated by trpc example which uses relative paths in the browser https://trpc.io/docs/client/nextjs/setup#4-create-trpc-hooks
 */
export const getBaseUrl = (allowRelative = false) => {
  if (allowRelative && typeof window !== "undefined")
    // browser should use relative path
    return "";

  if (!process.env.BASE_URL) throw new Error("Missing BASE_URL env var");

  return process.env.BASE_URL;
};

export const deepIsEqual = (a: unknown, b: unknown) => {
  return isEqual(a, b);
};
