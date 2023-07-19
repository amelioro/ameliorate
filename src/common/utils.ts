export const getBaseUrl = () => {
  if (typeof window !== "undefined")
    // browser should use relative path
    return "";

  if (!process.env.BASE_URL) throw new Error("Missing BASE_URL env var");

  return process.env.BASE_URL;
};
