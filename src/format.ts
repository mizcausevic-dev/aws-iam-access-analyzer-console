import type { ConsoleReport, FindingSeverity } from "./types.js";

const SEVERITY_LABEL: Record<FindingSeverity, string> = {
  high: "🔴 high",
  medium: "🟠 medium",
  low: "🟡 low",
  info: "ℹ️ info"
};

const SEVERITY_RANK: Record<FindingSeverity, number> = {
  high: 0,
  medium: 1,
  low: 2,
  info: 3
};

export function toMarkdown(report: ConsoleReport): string {
  const lines: string[] = [];
  lines.push(report.ok ? "# AWS access analyzer posture ✅" : "# AWS access analyzer posture ❌");
  lines.push("");
  lines.push(`Generated: \`${report.generatedAt}\``);
  lines.push("");
  lines.push("## Coverage");
  lines.push("");
  lines.push(`- Analyzers: **${report.analyzers}**`);
  lines.push(`- Active analyzers: **${report.activeAnalyzers}**`);
  lines.push(`- Findings: **${report.findings}**`);
  lines.push(`- Public active findings: **${report.publicResources}**`);
  lines.push(`- External active findings: **${report.externalResources}**`);
  lines.push("");
  lines.push("## Findings by status");
  lines.push("");
  lines.push("| ACTIVE | ARCHIVED | RESOLVED |");
  lines.push("|---:|---:|---:|");
  lines.push(
    `| ${report.findingsByStatus.ACTIVE} | ${report.findingsByStatus.ARCHIVED} | ${report.findingsByStatus.RESOLVED} |`
  );

  const ranked = [...report.findingsList].sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
  if (ranked.length > 0) {
    lines.push("");
    lines.push(`## Findings (${ranked.length})`);
    lines.push("");
    lines.push("| severity | code | subject | message |");
    lines.push("|---|---|---|---|");
    for (const finding of ranked) {
      lines.push(
        `| ${SEVERITY_LABEL[finding.severity]} | \`${finding.code}\` | ${finding.subjectName ?? finding.subject} | ${finding.message} |`
      );
    }
  } else {
    lines.push("");
    lines.push("No findings.");
  }
  return lines.join("\n");
}

export function toSummary(report: ConsoleReport): string {
  const counts: Record<FindingSeverity, number> = { high: 0, medium: 0, low: 0, info: 0 };
  for (const finding of report.findingsList) counts[finding.severity] += 1;
  return `${report.analyzers} analyzers · ${report.findings} findings · ${counts.high} high · ${counts.medium} medium (${report.ok ? "ok" : "fail"})`;
}
