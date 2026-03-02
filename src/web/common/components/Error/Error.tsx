import { Button, Typography } from "@mui/material";
import * as Sentry from "@sentry/nextjs";
import { ReactNode } from "react";

import { Link } from "@/web/common/components/Link";
import { useSessionUser } from "@/web/common/hooks";

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

export const AppError = ({
  statusCode,
  title,
  message,
  children,
}: {
  statusCode?: number;
  title?: string;
  message?: ReactNode;
  children?: ReactNode;
}) => {
  const { sessionUser } = useSessionUser();
  const isLoggedIn = sessionUser != null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
      <Typography variant="h4" component="h1" fontWeight="bold">
        {statusCode ? `${statusCode} - ` : ""}
        {title ?? "An error occurred"}
      </Typography>

      {message && <Typography color="text.secondary">{message}</Typography>}

      <div className="mt-4 flex justify-center gap-4">
        {children ?? (
          <>
            <Button component={Link} href="/" variant="contained">
              Go Home
            </Button>
            {!isLoggedIn && (
              <Button component={Link} href="/api/auth/login" variant="outlined">
                Login
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export const QueryError = ({ error }: { error: Error }) => {
  logWarning(`QueryError rendered: ${error.message}`, error.data?.httpStatus ?? 500);

  // TRPC should be setting this, so this shouldn't happen
  if (!error.data) return <AppError title={error.message} statusCode={500} />;

  return <AppError title={error.message} statusCode={error.data.httpStatus} />;
};
export const NotFoundError = () => {
  logWarning("NotFoundError rendered", 404);

  return <AppError statusCode={404} title="Page not found" />;
};

export const NotLoggedInError = () => {
  logWarning("NotLoggedInError rendered", 401);

  return <AppError statusCode={401} title="You must be logged in to view this page" />;
};

export const TopicNotFoundError = () => {
  return (
    <AppError
      title="Topic not found"
      message="Either this topic doesn’t exist, or you don’t have permission to view it."
    />
  );
};
