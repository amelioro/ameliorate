/**
 * Catch and monitor errors from the Next.js error page. See docs https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#react-render-errors-in-pages-router
 *
 * Note: sometimes we render the `next/error` component in place of another page (e.g. loading /[username] but user isn't found).
 * In those cases, this `_error` page isn't actually routed to - we're just rendering the same error component,
 * and so those usages manage their own sentry logging separate from this page.
 */

import * as Sentry from "@sentry/nextjs";
import type { NextPage } from "next";
import type { ErrorProps } from "next/error";
import Error from "next/error";

const CustomErrorComponent: NextPage<ErrorProps> = (props) => {
  return <Error statusCode={props.statusCode} />;
};

// eslint-disable-next-line functional/immutable-data
CustomErrorComponent.getInitialProps = async (contextData) => {
  // In case this is running in a serverless function, await this in order to give Sentry
  // time to send the error before the lambda exits
  await Sentry.captureUnderscoreErrorException(contextData);

  // This will contain the status code of the response
  return Error.getInitialProps(contextData);
};

export default CustomErrorComponent;
