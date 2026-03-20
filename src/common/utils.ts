import { isEqual } from "es-toolkit";

/**
 * @param allowRelative motivated by trpc example which uses relative paths in the browser https://trpc.io/docs/client/nextjs/setup#4-create-trpc-hooks
 */
export const getBaseUrl = (allowRelative = false) => {
  if (allowRelative && typeof window !== "undefined")
    // browser should use relative path
    return "";

  if (!process.env.BASE_URL) throw new Error("Missing BASE_URL env var");

  return process.env.BASE_URL;
};

export const deepIsEqual = (a: unknown, b: unknown) => {
  return isEqual(a, b);
};

/**
 * Recursively compares `oldData` and `newData` and returns a value that reuses references from
 * `oldData` for any sub-values that are deeply equal to `newData`. This provides structural
 * sharing: only the parts that actually changed get new references, while unchanged sub-trees
 * (including individual array items) keep their old ones.
 *
 * Didn't review this thoroughly but it seems good and tests seem good. Inspired by Tanstack Query's
 * `replaceEqualDeep`. Thanks LLM.
 */
export const replaceEqualDeep = <T>(oldData: T, newData: T): T => {
  if (oldData === newData) return oldData;

  // If both are arrays, structurally share each element
  if (Array.isArray(oldData) && Array.isArray(newData)) {
    const oldArr = oldData as unknown[];
    const shared = newData.map((item: unknown, i: number) =>
      i < oldArr.length ? replaceEqualDeep(oldArr[i], item) : item,
    );
    if (
      shared.length === oldData.length &&
      shared.every((item, i) => item === (oldData as unknown[])[i])
    )
      return oldData;
    return shared as T;
  }

  // If both are plain objects, structurally share each property
  if (isPlainObject(oldData) && isPlainObject(newData)) {
    const oldObj = oldData as Record<string, unknown>;
    const newKeys = Object.keys(newData);
    const shared = Object.fromEntries(
      newKeys.map((key) => [
        key,
        key in oldObj
          ? replaceEqualDeep(oldObj[key], (newData as Record<string, unknown>)[key])
          : (newData as Record<string, unknown>)[key],
      ]),
    );
    if (
      newKeys.length === Object.keys(oldObj).length &&
      newKeys.every((key) => shared[key] === oldObj[key])
    )
      return oldData;
    return shared as T;
  }

  return newData;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype;
