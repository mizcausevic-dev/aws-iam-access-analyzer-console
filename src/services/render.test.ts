// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, test } from "vitest";

import {
  severityClass,
  renderAnalyzerLane,
  renderDocs,
  renderFindingRisks,
  renderOverview,
  renderRemediationPosture,
  renderVerification
} from "./render.js";

describe("render", () => {
  test("overview contains control-plane framing", () => {
    const html = renderOverview();
    expect(html).toContain("AWS public access, cross-account trust");
    expect(html).toContain("Product depth");
    expect(html).toContain("What these repos have in common");
    expect(html).toContain("portfolio.kineticgain.com");
    expect(html).toContain("GTM story");
  });

  test("detail pages expose their lane names", () => {
    expect(renderAnalyzerLane()).toContain("Analyzer Lane");
    expect(renderFindingRisks()).toContain("Finding Risks");
    expect(renderRemediationPosture()).toContain("Remediation Posture");
    expect(renderVerification()).toContain("Verification");
    expect(renderDocs()).toContain("Offline Access Analyzer analysis");
  });

  test("severity mapping covers known and fallback states", () => {
    expect(severityClass("high")).toBe("red");
    expect(severityClass("medium")).toBe("yellow");
    expect(severityClass("low")).toBe("green");
    expect(severityClass("unknown")).toBe("info");
  });
});
