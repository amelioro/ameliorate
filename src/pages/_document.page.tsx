import { Head, Html, Main, NextScript } from "next/document";

// grab default font size from root <html> if we're on the client
// thanks https://stackoverflow.com/a/49299352
export const htmlDefaultFontSize =
  typeof window !== "undefined" && typeof document !== "undefined"
    ? Number(
        window
          .getComputedStyle(document.documentElement)
          .getPropertyValue("font-size")
          // remove "px" from the end
          .slice(0, -2),
      )
    : 16; // default, should only be used if we're on the server, where our value should be overridden when on the client

/**
 * i.e. there's a px value that looks good with 16px font size, but if default font size is different, we should scale the px
 *
 * this should only be necessary where there's no option to use rem, i.e. for the layout algorithm
 */
export const scalePxViaDefaultFontSize = (px: number) => px * (htmlDefaultFontSize / 16);

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
