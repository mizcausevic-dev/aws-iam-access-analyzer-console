# Changelog

## v1.0.0-prod — 2026-05-27

Production-readiness hardening on top of v0.1-shipped.

- Verified all CI gates pass on a clean `npm ci`: lint, typecheck, coverage (95.81% statements / 84.95% branches / 95.23% functions / 95.81% lines), build, demo, smoke, `npm audit --audit-level=high` (0 vulnerabilities at high/critical).
- Confirmed AGPL-3.0-or-later licensing, `SECURITY.md`, `CODE_OF_CONDUCT.md`, weekly `dependabot.yml` for `npm` + `github-actions`.
- Confirmed CI workflow runs the Node 20 + 22 matrix and the production-status surfaces (CI / License / Deploy badges + `## Production status` block) are intact in the README.
- Live operator surface running at https://aws.kineticgain.com/ via the GitHub Pages deploy rail.
- No changes to source, README content, docs, or screenshots — those remain the v0.1-shipped surface from the build lane.

## v0.1.0 — 2026-05-30

- Initial release: operator surface for AWS IAM Access Analyzer findings and analyzer posture.
- Added a public dashboard surface with overview, analyzer-lane, finding-risks, remediation-posture, verification, and docs routes.
- Added prerendered GitHub Pages packaging for `aws.kineticgain.com` with `CNAME`, `robots.txt`, `sitemap.xml`, and OG/meta injection at deploy time.
- Added synthetic README proof screenshots and `docs/KINETIC_GAIN_EMBEDDED.md` tie-back packaging.
- Reads a combined JSON envelope `{ analyzers, findings }` — each section is optional.
- 8 finding codes covering missing active analyzers, disabled analyzers, missing archive rules, public S3/KMS access, cross-account role trust, unconstrained external principals, and stale active findings.
- Library API: `analyze(input, opts)` → `ConsoleReport`; `toMarkdown(report)` + `toSummary(report)` formatters.
- CLI: `aws-iam-access-analyzer <export.json>` with `--format json|markdown|summary`, `--now <iso>`, `--stale-finding-after-days N`, `--fail-on-high`, `--out FILE`.
- Multi-cloud security lane (Wave 12) — opens the AWS identity and perimeter track next to the Microsoft admin portfolio.
- Node 20/22 CI (lint, typecheck, coverage, build, demo, smoke, prerender, `npm audit`), AGPL-3.0-or-later, Dependabot.
