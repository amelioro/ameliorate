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
