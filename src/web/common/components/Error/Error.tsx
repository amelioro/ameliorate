import NextError from "next/error";

interface Error {
  message: string;
  data?: {
    httpStatus: number;
  } | null;
}

export const QueryError = ({ error }: { error: Error }) => {
  // TRPC should be setting this, so this shouldn't happen
  if (!error.data) return <NextError title={error.message} statusCode={500} />;

  return <NextError title={error.message} statusCode={error.data.httpStatus} />;
};
export const NotFoundError = () => {
  return <NextError statusCode={404} />;
};

export const NotLoggedInError = () => {
  return <NextError statusCode={401} title="You must be logged in to view this page" />;
};
