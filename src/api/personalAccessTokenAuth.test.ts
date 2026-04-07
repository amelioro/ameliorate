import { describe, expect, test } from "vitest";

import { generateToken, hashToken } from "@/api/personalAccessTokenAuth";

describe("generateToken", () => {
  test("produces correct format", () => {
    const { plaintext, hash } = generateToken();

    expect(plaintext).toMatch(/^am_pat_[A-Za-z0-9_-]+$/);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  test("produces unique tokens on each call", () => {
    const { hash: hash1 } = generateToken();
    const { hash: hash2 } = generateToken();
    expect(hash1).not.toBe(hash2);
  });
});

describe("hashToken", () => {
  test("is deterministic", () => {
    const token = "am_pat_test1234567890";
    expect(hashToken(token)).toBe(hashToken(token));
  });

  test("produces different hashes for different inputs", () => {
    const hash1 = hashToken("am_pat_token1");
    const hash2 = hashToken("am_pat_token2");
    expect(hash1).not.toBe(hash2);
  });
});
