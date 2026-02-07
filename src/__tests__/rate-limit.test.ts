import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  it("allows requests within the limit", () => {
    const key = `test-${Date.now()}-allow`;
    const config = { limit: 3, windowSeconds: 60 };

    expect(checkRateLimit(key, config).success).toBe(true);
    expect(checkRateLimit(key, config).success).toBe(true);
    expect(checkRateLimit(key, config).success).toBe(true);
  });

  it("blocks requests over the limit", () => {
    const key = `test-${Date.now()}-block`;
    const config = { limit: 2, windowSeconds: 60 };

    expect(checkRateLimit(key, config).success).toBe(true);
    expect(checkRateLimit(key, config).success).toBe(true);
    expect(checkRateLimit(key, config).success).toBe(false);
  });

  it("returns correct remaining count", () => {
    const key = `test-${Date.now()}-remaining`;
    const config = { limit: 3, windowSeconds: 60 };

    expect(checkRateLimit(key, config).remaining).toBe(2);
    expect(checkRateLimit(key, config).remaining).toBe(1);
    expect(checkRateLimit(key, config).remaining).toBe(0);
  });

  it("different keys are independent", () => {
    const config = { limit: 1, windowSeconds: 60 };
    const key1 = `test-${Date.now()}-k1`;
    const key2 = `test-${Date.now()}-k2`;

    expect(checkRateLimit(key1, config).success).toBe(true);
    expect(checkRateLimit(key2, config).success).toBe(true);
    expect(checkRateLimit(key1, config).success).toBe(false);
    expect(checkRateLimit(key2, config).success).toBe(false);
  });
});
