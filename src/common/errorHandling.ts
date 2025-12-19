/**
 * Creates an error with the stringified data.
 *
 * Main intent here is to be able to easily log objects related to an error, without needing to know the relevant properties.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorWithData = (message: string, ...data: any[]) => {
  return new Error(
    data.length > 0 ? message + "\n\nrelated data:\n" + JSON.stringify(data) : message,
  );
};

/**
 * Wraps throwing an error so that an error can be thrown in-line.
 *
 * A typescript proposal currently exists to implement this natively; if that gets implemented, this would no longer be needed.
 * https://github.com/tc39/proposal-throw-expressions
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const throwError = (message: string, ...data: any[]) => {
  throw errorWithData(message, data);
};

/**
 * Try our best to retain everything about an error while adding data to it.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const rethrowWithData = (error: unknown, ...data: any[]) => {
  const typedError = error instanceof Error ? error : new Error(String(error));

  throw new Error(typedError.message + "\n\nrelated data:\n" + JSON.stringify(data), {
    cause: typedError,
  });
};
