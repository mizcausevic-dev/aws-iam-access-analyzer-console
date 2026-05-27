// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, test } from "vitest";

import {
  analyzerLane,
  findingRisks,
  payload,
  remediationPosture,
  summary,
  verification
} from "./awsIamAccessAnalyzerConsoleService.js";

describe("awsIamAccessAnalyzerConsoleService", () => {
  test("summary reflects the sample AWS posture", () => {
    expect(summary()).toMatchObject({
      analyzers: 2,
      activeAnalyzers: 1,
      findings: 4,
      publicResources: 2
    });
    expect(summary().highFindings).toBeGreaterThanOrEqual(3);
  });

  test("analyzer lane stays mapped to owners", () => {
    const lanes = analyzerLane();
    expect(lanes).toHaveLength(4);
    expect(lanes.some((lane) => lane.lane === "Production analyzer lane" && lane.owner === "Cloud Security Engineering")).toBe(true);
  });

  test("finding risks sort high severity first", () => {
    const risks = findingRisks();
    expect(risks[0]?.severity).toBe("high");
    expect(risks.some((risk) => risk.code === "public-bucket-access")).toBe(true);
  });

  test("remediation posture and verification stay populated", () => {
    expect(remediationPosture()).toHaveLength(5);
    expect(verification()).toHaveLength(5);
    expect(payload().sample).toBeDefined();
  });
});
