export const toSpaceCase = (str: string): string => {
  return str.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (s) => s.toUpperCase());
};
