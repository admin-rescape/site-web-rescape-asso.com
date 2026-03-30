import { describe, it, expect } from "vitest";
import { sanitizeArticleHtml } from "@/lib/sanitize";

describe("sanitize — sanitizeArticleHtml", () => {
    it("strips script tags", () => {
        const dirty = '<p>Hello</p><script>alert("xss")</script>';
        const result = sanitizeArticleHtml(dirty);
        expect(result).not.toContain("<script>");
        expect(result).toContain("<p>Hello</p>");
    });

    it("strips event handler attributes", () => {
        const dirty = '<img src="x" onerror="alert(1)" />';
        const result = sanitizeArticleHtml(dirty);
        expect(result).not.toContain("onerror");
    });

    it("allows safe formatting tags", () => {
        const dirty = "<h1>Title</h1><p>Text <strong>bold</strong> <em>italic</em></p>";
        const result = sanitizeArticleHtml(dirty);
        expect(result).toContain("<h1>");
        expect(result).toContain("<strong>");
        expect(result).toContain("<em>");
    });

    it("allows img with safe attributes", () => {
        const dirty = '<img src="https://example.com/img.png" alt="test" loading="lazy" />';
        const result = sanitizeArticleHtml(dirty);
        expect(result).toContain("src=");
        expect(result).toContain("alt=");
    });

    it("strips javascript: scheme from links", () => {
        const dirty = '<a href="javascript:alert(1)">Click</a>';
        const result = sanitizeArticleHtml(dirty);
        expect(result).not.toContain("javascript:");
    });

    it("allows mailto and https schemes in links", () => {
        const dirty = '<a href="mailto:test@test.fr">Email</a><a href="https://rescape.org">Site</a>';
        const result = sanitizeArticleHtml(dirty);
        expect(result).toContain("mailto:");
        expect(result).toContain("https://");
    });

    it("handles empty string", () => {
        expect(sanitizeArticleHtml("")).toBe("");
    });

    it("strips iframe tags", () => {
        const dirty = '<iframe src="https://evil.com"></iframe><p>Content</p>';
        const result = sanitizeArticleHtml(dirty);
        expect(result).not.toContain("<iframe");
        expect(result).toContain("<p>Content</p>");
    });
});
