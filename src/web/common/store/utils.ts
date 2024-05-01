import isEqual from "lodash/isEqual";

export const deepCompare = (a: unknown, b: unknown) => {
  return isEqual(a, b);
};
