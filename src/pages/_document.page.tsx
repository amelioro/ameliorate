import { Head, Html, Main, NextScript } from "next/document";

export const htmlDefaultFontSize = 16; // if we need to manually convert rem to px in many places, we can consider grabbing this from `html`

export default function Document() {
  return (
    <Html>
      <Head>
        {/* MUI fonts */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          // fix for "Error while reading CSS rules from [fonts href]" when taking screenshot of diagram
          // thanks https://github.com/bubkoo/html-to-image/issues/362#issuecomment-1381854613
          crossOrigin="anonymous"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
