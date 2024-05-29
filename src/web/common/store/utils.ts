import { createJSONStorage } from "zustand/middleware";

/**
 * Persist middleware doesn't automatically handle persisting dates.
 *
 * Solution similar to: https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md#createjsonstorage
 * Context: https://github.com/pmndrs/zustand/discussions/1720
 */
export const storageWithDates = createJSONStorage(() => sessionStorage, {
  reviver: (_key, value) => {
    if (typeof value === "string" && !isNaN(Date.parse(value))) {
      return new Date(value);
    }
    return value;
  },
  replacer: (_key, value) => {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  },
});
