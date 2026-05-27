import {
  type AccessAnalyzerExport,
  type AccessFinding,
  type ConsoleOptions,
  type ConsoleReport,
  type Finding,
  type FindingStatus
} from "./types.js";

const DAY_MS = 86_400_000;

function emptyStatusCounts(): Record<FindingStatus, number> {
  return {
    ACTIVE: 0,
    ARCHIVED: 0,
    RESOLVED: 0
  };
}

function lastSeenDate(finding: AccessFinding): Date {
  return new Date(finding.lastSeenAt ?? finding.createdAt);
}

export function analyze(input: AccessAnalyzerExport, opts: ConsoleOptions = {}): ConsoleReport {
  const now = opts.now ? new Date(opts.now) : new Date();
  const staleAfter = (opts.staleFindingAfterDays ?? 30) * DAY_MS;

  const analyzers = input.analyzers ?? [];
  const findings = input.findings ?? [];
  const findingsList: Finding[] = [];
  const findingsByStatus = emptyStatusCounts();

  const activeAnalyzers = analyzers.filter((analyzer) => analyzer.status === "ACTIVE");
  const publicFindings = findings.filter((finding) => finding.status === "ACTIVE" && finding.isPublic === true);
  const externalFindings = findings.filter((finding) => finding.status === "ACTIVE" && finding.isExternal === true);

  if (activeAnalyzers.length === 0) {
    findingsList.push({
      code: "no-active-analyzer",
      severity: "high",
      message: "No active IAM Access Analyzer is enabled for the captured AWS scope.",
      subject: "analyzers"
    });
  }

  for (const analyzer of analyzers) {
    if (analyzer.status === "DISABLED") {
      findingsList.push({
        code: "analyzer-disabled",
        severity: "medium",
        message: `Analyzer "${analyzer.name}" is disabled and will not surface new findings.`,
        subject: analyzer.id,
        subjectName: analyzer.name,
        region: analyzer.region
      });
    }

    if (analyzer.status === "ACTIVE" && (analyzer.archiveRules ?? 0) === 0) {
      findingsList.push({
        code: "archive-rules-missing",
        severity: "low",
        message: `Analyzer "${analyzer.name}" has no archive rules configured for expected benign findings.`,
        subject: analyzer.id,
        subjectName: analyzer.name,
        region: analyzer.region
      });
    }
  }

  for (const finding of findings) {
    if (finding.status in findingsByStatus) {
      findingsByStatus[finding.status] += 1;
    }

    if (finding.status !== "ACTIVE") {
      continue;
    }

    if (finding.isPublic && finding.resourceType === "S3Bucket") {
      findingsList.push({
        code: "public-bucket-access",
        severity: "high",
        message: `Bucket "${finding.resource}" is reachable by a public principal.`,
        subject: finding.id,
        subjectName: finding.resource,
        region: finding.region,
        principal: finding.principal
      });
    }

    if (finding.isPublic && finding.resourceType === "KMSKey") {
      findingsList.push({
        code: "public-kms-key-access",
        severity: "high",
        message: `KMS key "${finding.resource}" exposes public access posture that should be reviewed immediately.`,
        subject: finding.id,
        subjectName: finding.resource,
        region: finding.region,
        principal: finding.principal
      });
    }

    if (finding.isExternal && finding.resourceType === "IAMRole") {
      findingsList.push({
        code: "cross-account-role-trust",
        severity: "medium",
        message: `Role "${finding.resource}" trusts an external principal and should be validated against expected federation or vendor access.`,
        subject: finding.id,
        subjectName: finding.resource,
        region: finding.region,
        principal: finding.principal
      });
    }

    if (finding.isExternal && !finding.isPublic && (!finding.conditionKeys || finding.conditionKeys.length === 0)) {
      findingsList.push({
        code: "external-principal-without-condition",
        severity: "high",
        message: `Finding "${finding.resource}" allows an external principal without restrictive condition keys.`,
        subject: finding.id,
        subjectName: finding.resource,
        region: finding.region,
        principal: finding.principal
      });
    }

    if (now.getTime() - lastSeenDate(finding).getTime() > staleAfter) {
      findingsList.push({
        code: "stale-active-finding",
        severity: "medium",
        message: `Finding "${finding.resource}" has remained active since ${lastSeenDate(finding).toISOString().slice(0, 10)}.`,
        subject: finding.id,
        subjectName: finding.resource,
        region: finding.region,
        principal: finding.principal
      });
    }
  }

  return {
    generatedAt: now.toISOString(),
    analyzers: analyzers.length,
    activeAnalyzers: activeAnalyzers.length,
    findings: findings.length,
    findingsByStatus,
    publicResources: publicFindings.length,
    externalResources: externalFindings.length,
    findingsList,
    ok: !findingsList.some((finding) => finding.severity === "high")
  };
}
