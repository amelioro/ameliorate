import PlausibleProvider from "next-plausible";
import { AppProps } from "next/app";
import "../globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <PlausibleProvider domain="ameliorate.app">
      <Component {...pageProps} />;
    </PlausibleProvider>
  );
}
