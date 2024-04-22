/**
 * Creates an error with the stringified data.
 *
 * Main intent here is to be able to easily log objects related to an error, without needing to know the relevant properties.
 */
// eslint-disable-next-line functional/functional-parameters, @typescript-eslint/no-explicit-any
export const errorWithData = (message: string, ...data: any[]) => {
  return new Error(
    data.length > 0 ? message + "\n\nrelated data:\n" + JSON.stringify(data) : message
  );
};

/**
 * Wraps throwing an error so that an error can be thrown in-line.
 *
 * A typescript proposal currently exists to implement this natively; if that gets implemented, this would no longer be needed.
 * https://github.com/tc39/proposal-throw-expressions
 */
// eslint-disable-next-line functional/functional-parameters, @typescript-eslint/no-explicit-any
export const throwError = (message: string, ...data: any[]) => {
  throw errorWithData(message, data);
};

/**
 * Convenient way to wrap a function and return null if an error is thrown.
 */
export const tryOrNull = <T>(fn: () => T): T | null => {
  try {
    return fn();
  } catch {
    return null;
  }
};
