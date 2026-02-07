import { stripHtml, sanitizeText, sanitizeSlug } from "@/lib/sanitize";

describe("stripHtml", () => {
  it("removes HTML tags", () => {
    expect(stripHtml("<script>alert('xss')</script>")).toBe("alert('xss')");
    expect(stripHtml("<b>bold</b>")).toBe("bold");
    expect(stripHtml("no tags")).toBe("no tags");
  });

  it("handles nested tags", () => {
    expect(stripHtml("<div><p>text</p></div>")).toBe("text");
  });

  it("handles self-closing tags", () => {
    expect(stripHtml("line<br/>break")).toBe("linebreak");
  });
});

describe("sanitizeText", () => {
  it("strips HTML and trims", () => {
    expect(sanitizeText("  <b>hello</b>  ")).toBe("hello");
  });

  it("enforces max length", () => {
    const long = "a".repeat(200);
    expect(sanitizeText(long, 100)).toHaveLength(100);
  });

  it("handles empty strings", () => {
    expect(sanitizeText("")).toBe("");
    expect(sanitizeText("   ")).toBe("");
  });
});

describe("sanitizeSlug", () => {
  it("converts to lowercase with hyphens", () => {
    expect(sanitizeSlug("My Cool Build")).toBe("my-cool-build");
  });

  it("removes special characters", () => {
    expect(sanitizeSlug("build@#$%name!")).toBe("build-name");
  });

  it("collapses multiple hyphens", () => {
    expect(sanitizeSlug("build---name")).toBe("build-name");
  });

  it("trims leading/trailing hyphens", () => {
    expect(sanitizeSlug("-build-name-")).toBe("build-name");
  });

  it("limits length to 100", () => {
    const long = "a".repeat(150);
    expect(sanitizeSlug(long).length).toBeLessThanOrEqual(100);
  });
});
