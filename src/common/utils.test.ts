import { describe, expect, it } from "vitest";

import { replaceEqualDeep } from "@/common/utils";

describe("replaceEqualDeep", () => {
  it("when values are referentially equal, returns oldData", () => {
    const obj = { a: 1 };
    expect(replaceEqualDeep(obj, obj)).toBe(obj);
  });

  it("when values are equal primitives, returns oldData", () => {
    expect(replaceEqualDeep(1, 1)).toBe(1);
    expect(replaceEqualDeep("hello", "hello")).toBe("hello");
  });

  it("when values are different primitives, returns newData", () => {
    expect(replaceEqualDeep(1, 2)).toBe(2);
    expect(replaceEqualDeep("a", "b")).toBe("b");
  });

  it("when objects are deeply equal, reuses oldData reference", () => {
    const oldData = { a: 1, b: "hello" };
    const newData = { a: 1, b: "hello" };
    expect(replaceEqualDeep(oldData, newData)).toBe(oldData);
  });

  it("when a value changes, returns new object but reuses unchanged nested references", () => {
    const nested = { x: 1, y: 2 };
    const oldData = { a: nested, b: "old" };
    const newData = { a: { x: 1, y: 2 }, b: "new" };

    const result = replaceEqualDeep(oldData, newData);
    expect(result).not.toBe(oldData); // top-level changed
    expect(result.a).toBe(nested); // unchanged nested object reused
    expect(result.b).toBe("new"); // changed value updated
  });

  it("when all items are deeply equal, reuses oldData array reference", () => {
    const oldData = [
      { id: "1", val: "a" },
      { id: "2", val: "b" },
    ];
    const newData = [
      { id: "1", val: "a" },
      { id: "2", val: "b" },
    ];
    expect(replaceEqualDeep(oldData, newData)).toBe(oldData);
  });

  it("when nested value changes, returns new array but reuses unchanged item references", () => {
    const oldItem1 = { id: "1", val: "a" };
    const oldItem2 = { id: "2", val: "b" };
    const oldData = [oldItem1, oldItem2];
    const newItem2 = { id: "2", val: "changed" };
    const newData = [{ id: "1", val: "a" }, newItem2];

    const result = replaceEqualDeep(oldData, newData);
    expect(result).not.toBe(oldData); // array itself is new
    expect(result[0]).toBe(oldItem1); // unchanged item reused
    expect(result[1]).not.toBe(oldItem2); // changed item is new
    expect(result[1]).toEqual(newItem2);
  });

  it("when array grows, reuses old item references", () => {
    const oldItem1 = { id: "1", val: "a" };
    const oldData = [oldItem1, { id: "2", val: "b" }];
    const newData = [
      { id: "1", val: "a" },
      { id: "2", val: "b" },
      { id: "3", val: "c" },
    ];

    const result = replaceEqualDeep(oldData, newData);
    expect(result).not.toBe(oldData);
    expect(result[0]).toBe(oldItem1); // overlapping unchanged item reused
    expect(result).toHaveLength(3);
  });

  it("when array shrinks, reuses old item references", () => {
    const oldItem1 = { id: "1", val: "a" };
    const oldData = [oldItem1, { id: "2", val: "b" }, { id: "3", val: "c" }];
    const newData = [{ id: "1", val: "a" }];

    const result = replaceEqualDeep(oldData, newData);
    expect(result).not.toBe(oldData);
    expect(result[0]).toBe(oldItem1); // overlapping unchanged item reused
    expect(result).toHaveLength(1);
  });

  it("when object gains keys, reuses old property references", () => {
    const nested = { x: 1 };
    const oldData = { a: nested } as Record<string, unknown>;
    const newData = { a: { x: 1 }, b: 2 };

    const result = replaceEqualDeep(oldData, newData);
    expect(result).not.toBe(oldData);
    expect(result.a).toBe(nested); // overlapping unchanged prop reused
  });

  it("when object contains nested arrays, reuses old array references", () => {
    const innerArr = [1, 2, 3];
    const oldData = { data: innerArr, label: "test" };
    const newData = { data: [1, 2, 3], label: "changed" };

    const result = replaceEqualDeep(oldData, newData);
    expect(result).not.toBe(oldData);
    expect(result.data).toBe(innerArr); // unchanged nested array reused
    expect(result.label).toBe("changed");
  });

  it("handles null and undefined", () => {
    expect(replaceEqualDeep(null, null)).toBe(null);
    expect(replaceEqualDeep(null, { a: 1 })).toEqual({ a: 1 });
    expect(replaceEqualDeep({ a: 1 }, null)).toBe(null);
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression -- not really sure why this gives an error, it looks fine to me
    expect(replaceEqualDeep(undefined, undefined)).toBe(undefined);
  });
});
