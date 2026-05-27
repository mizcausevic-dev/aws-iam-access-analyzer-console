// SPDX-License-Identifier: AGPL-3.0-or-later

import { analyze } from "../analyze.js";
import { analyzerLanePackets, remediationPackets, sampleAccessAnalyzerPayload } from "../data/sampleAccessAnalyzer.js";
import type { Finding } from "../types.js";

const NOW = "2026-05-30T00:00:00Z";
const report = analyze(sampleAccessAnalyzerPayload, {
  now: NOW,
  staleFindingAfterDays: 30
});

function severityRank(finding: Finding): number {
  return finding.severity === "high"
    ? 0
    : finding.severity === "medium"
      ? 1
      : finding.severity === "low"
        ? 2
        : 3;
}

export function summary() {
  return {
    analyzers: report.analyzers,
    activeAnalyzers: report.activeAnalyzers,
    findings: report.findings,
    publicResources: report.publicResources,
    externalResources: report.externalResources,
    highFindings: report.findingsList.filter((finding) => finding.severity === "high").length,
    recommendation:
      "Clear public access, add restrictive trust conditions, and restore disabled analyzer coverage before calling AWS perimeter posture healthy."
  };
}

export function analyzerLane() {
  return analyzerLanePackets.map((lane) => ({
    ...lane,
    relatedFindings: report.findingsList.filter((finding) => {
      if (lane.id === "prod-perimeter") {
        return finding.code === "public-bucket-access" || finding.code === "public-kms-key-access";
      }
      if (lane.id === "vendor-role") {
        return finding.code === "cross-account-role-trust" || finding.code === "external-principal-without-condition";
      }
      if (lane.id === "ops-secondary") {
        return finding.code === "analyzer-disabled";
      }
      if (lane.id === "archive-hygiene") {
        return finding.code === "archive-rules-missing" || finding.code === "stale-active-finding";
      }
      return false;
    }).length
  }));
}

export function findingRisks() {
  return [...report.findingsList]
    .sort((left, right) => severityRank(left) - severityRank(right))
    .map((finding) => ({
      ...finding,
      owner:
        finding.code === "analyzer-disabled" || finding.code === "archive-rules-missing"
          ? "Platform Operations"
          : finding.code === "cross-account-role-trust" || finding.code === "external-principal-without-condition"
            ? "IAM Platform"
            : "Cloud Security Engineering"
    }));
}

export function remediationPosture() {
  return remediationPackets;
}

export function verification() {
  return [
    "The dashboard is backed by a real offline analyzer and CLI, not static copy alone.",
    "Analyzers and findings are synthetic sample data only; no live AWS credentials or account identifiers are published.",
    "The control plane keeps public access, cross-account trust, and analyzer coverage visible for AWS platform and security stakeholders.",
    "This surface demonstrates AWS IAM Access Analyzer and IAM perimeter operations, not a generic cloud keyword project.",
    "It complements Azure / Microsoft admin proof with a concrete AWS identity and perimeter lane."
  ];
}

export function payload() {
  return {
    summary: summary(),
    analyzerLane: analyzerLane(),
    findingRisks: findingRisks(),
    remediationPosture: remediationPosture(),
    verification: verification(),
    sample: sampleAccessAnalyzerPayload
  };
}
