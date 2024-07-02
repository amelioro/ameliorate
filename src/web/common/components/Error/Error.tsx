import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";

const logWarning = (message: string, statusCode: number) => {
  Sentry.setTag("statusCode", statusCode);
  Sentry.captureMessage(message, "warning");
};

interface Error {
  message: string;
  data?: {
    httpStatus: number;
  } | null;
}

export const QueryError = ({ error }: { error: Error }) => {
  logWarning(`QueryError rendered: ${error.message}`, error.data?.httpStatus ?? 500);

  // TRPC should be setting this, so this shouldn't happen
  if (!error.data) return <NextError title={error.message} statusCode={500} />;

  return <NextError title={error.message} statusCode={error.data.httpStatus} />;
};
export const NotFoundError = () => {
  logWarning("NotFoundError rendered", 404);

  return <NextError statusCode={404} />;
};

export const NotLoggedInError = () => {
  logWarning("NotLoggedInError rendered", 401);

  return <NextError statusCode={401} title="You must be logged in to view this page" />;
};
