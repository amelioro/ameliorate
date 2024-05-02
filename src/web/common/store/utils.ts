import isEqual from "lodash/isEqual";

export const deepIsEqual = (a: unknown, b: unknown) => {
  return isEqual(a, b);
};
