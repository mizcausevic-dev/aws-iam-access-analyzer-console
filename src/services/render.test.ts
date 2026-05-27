// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, test } from "vitest";

import {
  renderAnalyzerLane,
  renderDocs,
  renderFindingRisks,
  renderOverview,
  renderRemediationPosture,
  renderVerification
} from "./render.js";

describe("render", () => {
  test("overview contains control-plane framing", () => {
    expect(renderOverview()).toContain("AWS public access, cross-account trust");
  });

  test("detail pages expose their lane names", () => {
    expect(renderAnalyzerLane()).toContain("Analyzer Lane");
    expect(renderFindingRisks()).toContain("Finding Risks");
    expect(renderRemediationPosture()).toContain("Remediation Posture");
    expect(renderVerification()).toContain("Verification");
    expect(renderDocs()).toContain("Offline Access Analyzer analysis");
  });
});
