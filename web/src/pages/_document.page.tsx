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
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
