import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { analyze } from "../src/analyze.js";
import { toMarkdown, toSummary } from "../src/format.js";
import type { AccessAnalyzerExport } from "../src/types.js";

const here = fileURLToPath(new URL(".", import.meta.url));
const fixture = (name: string): AccessAnalyzerExport =>
  JSON.parse(readFileSync(`${here}/../fixtures/${name}`, "utf8")) as AccessAnalyzerExport;

const NOW = "2026-05-30T00:00:00Z";

describe("analyze", () => {
  it("counts analyzers and findings", () => {
    const report = analyze(fixture("access-analyzer.json"), { now: NOW });
    expect(report.analyzers).toBe(2);
    expect(report.activeAnalyzers).toBe(1);
    expect(report.findings).toBe(4);
  });

  it("flags missing active analyzer as high", () => {
    const report = analyze({ analyzers: [], findings: [] }, { now: NOW });
    expect(report.findingsList.find((finding) => finding.code === "no-active-analyzer")?.severity).toBe("high");
  });

  it("flags disabled analyzers", () => {
    const report = analyze(fixture("access-analyzer.json"), { now: NOW });
    expect(report.findingsList.find((finding) => finding.code === "analyzer-disabled")?.subjectName).toContain("ops-secondary");
  });

  it("flags public bucket access", () => {
    const report = analyze(fixture("access-analyzer.json"), { now: NOW });
    expect(report.findingsList.find((finding) => finding.code === "public-bucket-access")?.subjectName).toContain("marketing-export-drop");
  });

  it("flags public kms access", () => {
    const report = analyze(fixture("access-analyzer.json"), { now: NOW });
    expect(report.findingsList.find((finding) => finding.code === "public-kms-key-access")?.severity).toBe("high");
  });

  it("flags cross-account role trust and missing conditions", () => {
    const report = analyze(fixture("access-analyzer.json"), { now: NOW });
    expect(report.findingsList.find((finding) => finding.code === "cross-account-role-trust")).toBeDefined();
    expect(report.findingsList.find((finding) => finding.code === "external-principal-without-condition")?.principal).toContain("444455556666");
  });

  it("flags stale active findings", () => {
    const report = analyze(fixture("access-analyzer.json"), { now: NOW, staleFindingAfterDays: 20 });
    expect(report.findingsList.find((finding) => finding.code === "stale-active-finding")).toBeDefined();
  });

  it("ok=true on a clean fixture", () => {
    const report = analyze(fixture("access-analyzer-clean.json"), { now: NOW });
    expect(report.ok).toBe(true);
    expect(report.findingsList.filter((finding) => finding.severity === "high")).toEqual([]);
  });
});

describe("formatters", () => {
  it("toMarkdown ranks high findings first", () => {
    const markdown = toMarkdown(analyze(fixture("access-analyzer.json"), { now: NOW }));
    expect(markdown).toContain("❌");
    expect(markdown.indexOf("🔴")).toBeLessThan(markdown.indexOf("🟠"));
  });

  it("toSummary emits a one-liner", () => {
    const summary = toSummary(analyze(fixture("access-analyzer.json"), { now: NOW }));
    expect(summary).toMatch(/analyzers/);
    expect(summary).toMatch(/findings/);
  });
});
