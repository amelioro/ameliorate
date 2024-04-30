export const deepCompare = (a: unknown, b: unknown) => {
  return JSON.stringify(a) === JSON.stringify(b);
};
