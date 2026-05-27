#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

import { analyze } from "./analyze.js";
import { toMarkdown, toSummary } from "./format.js";
import type { AccessAnalyzerExport, ConsoleOptions } from "./types.js";

type Format = "json" | "markdown" | "summary";

interface Args {
  input?: string;
  format: Format;
  now?: string;
  staleFindingAfterDays?: number;
  failOnHigh: boolean;
  out?: string;
  help: boolean;
}

const FORMATS: Format[] = ["json", "markdown", "summary"];

function parseArgs(argv: string[]): Args {
  const args: Args = { format: "json", failOnHigh: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") args.help = true;
    else if (a === "--format") {
      const v = argv[++i] as Format;
      if (!FORMATS.includes(v)) throw new Error(`--format must be one of: ${FORMATS.join(", ")}`);
      args.format = v;
    } else if (a === "--now") args.now = argv[++i];
    else if (a === "--stale-finding-after-days") args.staleFindingAfterDays = Number(argv[++i]);
    else if (a === "--fail-on-high") args.failOnHigh = true;
    else if (a === "--out") args.out = argv[++i];
    else if (!a.startsWith("-")) args.input = a;
    else throw new Error(`Unknown option: ${a}`);
  }
  return args;
}

const HELP = `aws-iam-access-analyzer-console - AWS IAM Access Analyzer posture

Usage:
  aws-iam-access-analyzer <export.json>
      [--format json|markdown|summary]
      [--now <iso>]
      [--stale-finding-after-days 30]
      [--fail-on-high] [--out FILE]

Input shape:
  {
    "analyzers": [...],
    "findings": [...]
  }

Exit code:
  0 - no high findings (or --fail-on-high not set)
  1 - high finding and --fail-on-high set
  2 - usage / I/O error`;

export function run(argv: string[]): number {
  let args: Args;
  try {
    args = parseArgs(argv);
  } catch (error) {
    process.stderr.write(`${(error as Error).message}\n`);
    return 2;
  }

  if (args.help || !args.input) {
    process.stdout.write(`${HELP}\n`);
    return args.help ? 0 : 2;
  }

  let payload: AccessAnalyzerExport;
  try {
    payload = JSON.parse(readFileSync(args.input, "utf8")) as AccessAnalyzerExport;
  } catch (error) {
    process.stderr.write(`error reading input: ${(error as Error).message}\n`);
    return 2;
  }

  const opts: ConsoleOptions = {};
  if (args.now) opts.now = args.now;
  if (args.staleFindingAfterDays !== undefined) opts.staleFindingAfterDays = args.staleFindingAfterDays;

  const report = analyze(payload, opts);

  let out: string;
  if (args.format === "json") out = JSON.stringify(report, null, 2);
  else if (args.format === "markdown") out = toMarkdown(report);
  else out = toSummary(report);

  if (args.out) writeFileSync(args.out, `${out}\n`, "utf8");
  else process.stdout.write(`${out}\n`);

  if (args.failOnHigh && !report.ok) return 1;
  return 0;
}

const invokedDirectly =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  try {
    process.exit(run(process.argv.slice(2)));
  } catch (error) {
    process.stderr.write(`fatal: ${(error as Error).message}\n`);
    process.exit(2);
  }
}
