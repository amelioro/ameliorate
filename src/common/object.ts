import mergeWith from "lodash/mergeWith";

export const withDefaults = <T>(value: Partial<T>, defaultValue: T): T => {
  // thanks https://stackoverflow.com/a/66247134/8409296
  // empty object to avoid mutation
  return mergeWith({}, defaultValue, value, (_a, b) => (Array.isArray(b) ? b : undefined));
};
