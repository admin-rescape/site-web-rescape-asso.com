import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

describe("rate-limit — rateLimit", () => {
    beforeEach(() => {
        // Each test uses a unique key to avoid cross-test interference
    });

    it("allows requests within the limit", () => {
        const key = `test-allow-${Date.now()}`;
        expect(rateLimit(key, { limit: 3, windowSec: 60 })).toBe(true);
        expect(rateLimit(key, { limit: 3, windowSec: 60 })).toBe(true);
        expect(rateLimit(key, { limit: 3, windowSec: 60 })).toBe(true);
    });

    it("blocks requests exceeding the limit", () => {
        const key = `test-block-${Date.now()}`;
        rateLimit(key, { limit: 2, windowSec: 60 });
        rateLimit(key, { limit: 2, windowSec: 60 });
        expect(rateLimit(key, { limit: 2, windowSec: 60 })).toBe(false);
    });

    it("allows the first request for a new key", () => {
        const key = `test-new-${Date.now()}`;
        expect(rateLimit(key, { limit: 1, windowSec: 60 })).toBe(true);
    });

    it("different keys have independent limits", () => {
        const key1 = `test-indep-a-${Date.now()}`;
        const key2 = `test-indep-b-${Date.now()}`;
        rateLimit(key1, { limit: 1, windowSec: 60 });
        expect(rateLimit(key1, { limit: 1, windowSec: 60 })).toBe(false);
        expect(rateLimit(key2, { limit: 1, windowSec: 60 })).toBe(true);
    });
});

describe("rate-limit — getClientIp", () => {
    it("extracts IP from x-forwarded-for header", () => {
        const req = new Request("http://localhost", {
            headers: { "x-forwarded-for": "192.168.1.1, 10.0.0.1" },
        });
        expect(getClientIp(req)).toBe("192.168.1.1");
    });

    it("returns 'unknown' when no forwarded header", () => {
        const req = new Request("http://localhost");
        expect(getClientIp(req)).toBe("unknown");
    });
});
