// SPDX-License-Identifier: AGPL-3.0-or-later

import type { AccessAnalyzerExport } from "../types.js";

export interface AnalyzerLanePacket {
  id: string;
  lane: string;
  owner: string;
  focus: string;
  status: "green" | "yellow" | "red";
  nextAction: string;
  note: string;
}

export interface RemediationPacket {
  packetId: string;
  lane: string;
  owner: string;
  completenessScore: number;
  status: "red" | "yellow" | "green";
  blocker: string;
  launchWindowHours: number;
  decisionNote: string;
}

export const sampleAccessAnalyzerPayload: AccessAnalyzerExport = {
  analyzers: [
    {
      id: "analyzer-prod",
      name: "prod-perimeter",
      region: "us-east-1",
      type: "ACCOUNT",
      status: "ACTIVE",
      archiveRules: 2
    },
    {
      id: "analyzer-ops",
      name: "ops-secondary",
      region: "us-west-2",
      type: "ACCOUNT",
      status: "DISABLED",
      archiveRules: 0
    }
  ],
  findings: [
    {
      id: "finding-public-bucket",
      resource: "arn:aws:s3:::marketing-export-drop",
      resourceType: "S3Bucket",
      region: "us-east-1",
      status: "ACTIVE",
      principal: "*",
      action: ["s3:GetObject"],
      conditionKeys: [],
      isPublic: true,
      isExternal: true,
      createdAt: "2026-04-20T00:00:00Z",
      lastSeenAt: "2026-04-24T00:00:00Z"
    },
    {
      id: "finding-cross-account-role",
      resource: "arn:aws:iam::111122223333:role/vendor-billing-export",
      resourceType: "IAMRole",
      region: "us-east-1",
      status: "ACTIVE",
      principal: "arn:aws:iam::444455556666:root",
      action: ["sts:AssumeRole"],
      conditionKeys: [],
      isPublic: false,
      isExternal: true,
      createdAt: "2026-05-01T00:00:00Z",
      lastSeenAt: "2026-05-24T00:00:00Z"
    },
    {
      id: "finding-public-kms",
      resource: "arn:aws:kms:us-east-1:111122223333:key/abcd-1234",
      resourceType: "KMSKey",
      region: "us-east-1",
      status: "ACTIVE",
      principal: "*",
      action: ["kms:Decrypt"],
      conditionKeys: ["aws:PrincipalOrgID"],
      isPublic: true,
      isExternal: true,
      createdAt: "2026-05-18T00:00:00Z",
      lastSeenAt: "2026-05-24T00:00:00Z"
    },
    {
      id: "finding-resolved-lambda",
      resource: "arn:aws:lambda:us-west-2:111122223333:function:legacy-open-webhook",
      resourceType: "LambdaFunction",
      region: "us-west-2",
      status: "RESOLVED",
      principal: "arn:aws:iam::777788889999:root",
      action: ["lambda:InvokeFunction"],
      conditionKeys: ["aws:SourceArn"],
      isPublic: false,
      isExternal: true,
      createdAt: "2026-04-02T00:00:00Z",
      lastSeenAt: "2026-05-02T00:00:00Z"
    }
  ]
};

export const analyzerLanePackets: AnalyzerLanePacket[] = [
  {
    id: "prod-perimeter",
    lane: "Production analyzer lane",
    owner: "Cloud Security Engineering",
    focus: "Public perimeter findings in primary account",
    status: "red",
    nextAction: "Clear public S3 and KMS posture before assuming account boundary is governed.",
    note: "This is the highest-risk lane because active public findings are still open."
  },
  {
    id: "vendor-role",
    lane: "Vendor trust lane",
    owner: "IAM Platform",
    focus: "Cross-account role assumptions",
    status: "yellow",
    nextAction: "Attach restrictive conditions or rotate to scoped federation before the next vendor rollout.",
    note: "External trust is expected in places, but should never stay unconstrained."
  },
  {
    id: "ops-secondary",
    lane: "Secondary region analyzer",
    owner: "Platform Operations",
    focus: "Coverage outside primary account path",
    status: "red",
    nextAction: "Re-enable the disabled analyzer and confirm archive-rule baseline in the secondary region.",
    note: "A disabled analyzer creates blind spots even if primary-account posture looks healthy."
  },
  {
    id: "archive-hygiene",
    lane: "Archive hygiene lane",
    owner: "Cloud Governance",
    focus: "Expected-benign finding suppression",
    status: "yellow",
    nextAction: "Define archive rules so known safe patterns stop drowning active operator triage.",
    note: "Archive rules are not just noise control - they shape triage clarity."
  }
];

export const remediationPackets: RemediationPacket[] = [
  {
    packetId: "AA-12",
    lane: "Public S3 perimeter",
    owner: "Cloud Security Engineering",
    completenessScore: 51,
    status: "red",
    blocker: "Public S3 bucket access is still active with a wildcard principal",
    launchWindowHours: 8,
    decisionNote: "Do not claim perimeter posture is clean while public object access remains active."
  },
  {
    packetId: "AA-19",
    lane: "Vendor trust path",
    owner: "IAM Platform",
    completenessScore: 63,
    status: "red",
    blocker: "Cross-account role trust is missing restrictive conditions",
    launchWindowHours: 16,
    decisionNote: "Scope down vendor trust before the next deployment or audit packet."
  },
  {
    packetId: "AA-24",
    lane: "KMS key exposure",
    owner: "Data Security",
    completenessScore: 72,
    status: "yellow",
    blocker: "Public-facing KMS permission posture needs policy review and condition validation",
    launchWindowHours: 18,
    decisionNote: "The org condition helps, but public posture still needs a cleaner key policy."
  },
  {
    packetId: "AA-31",
    lane: "Secondary region coverage",
    owner: "Platform Operations",
    completenessScore: 58,
    status: "red",
    blocker: "Access Analyzer is disabled in the secondary region",
    launchWindowHours: 20,
    decisionNote: "Blind spots matter as much as active findings - restore analyzer coverage first."
  },
  {
    packetId: "AA-40",
    lane: "Resolved Lambda path",
    owner: "Cloud Governance",
    completenessScore: 95,
    status: "green",
    blocker: "No active blocker",
    launchWindowHours: 48,
    decisionNote: "Resolved examples can be archived as healthy proof for future reviews."
  }
];
