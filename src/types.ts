// Operator surface for AWS IAM Access Analyzer findings and analyzer posture.
//
// Inputs reflect exported or captured AWS IAM Access Analyzer payloads:
//   - account/organization analyzers
//   - access preview / finding summaries for public or cross-account access

export type AnalyzerType = "ACCOUNT" | "ORGANIZATION";
export type AnalyzerStatus = "ACTIVE" | "DISABLED";
export type FindingStatus = "ACTIVE" | "ARCHIVED" | "RESOLVED";
export type ResourceType =
  | "S3Bucket"
  | "KMSKey"
  | "IAMRole"
  | "LambdaFunction"
  | "SQSQueue"
  | "ECRRepository"
  | string;

export interface Analyzer {
  id: string;
  name: string;
  region: string;
  type: AnalyzerType;
  status: AnalyzerStatus;
  archiveRules?: number;
}

export interface AccessFinding {
  id: string;
  resource: string;
  resourceType: ResourceType;
  region: string;
  status: FindingStatus;
  principal: string;
  action?: string[];
  conditionKeys?: string[];
  isPublic?: boolean;
  isExternal?: boolean;
  createdAt: string;
  lastSeenAt?: string;
  note?: string;
}

export interface AccessAnalyzerExport {
  analyzers?: Analyzer[];
  findings?: AccessFinding[];
}

export type FindingSeverity = "high" | "medium" | "low" | "info";

export type FindingCode =
  | "no-active-analyzer"
  | "analyzer-disabled"
  | "archive-rules-missing"
  | "public-bucket-access"
  | "public-kms-key-access"
  | "cross-account-role-trust"
  | "external-principal-without-condition"
  | "stale-active-finding";

export interface Finding {
  code: FindingCode;
  severity: FindingSeverity;
  message: string;
  subject: string;
  subjectName?: string;
  region?: string;
  principal?: string;
}

export interface ConsoleReport {
  generatedAt: string;
  analyzers: number;
  activeAnalyzers: number;
  findings: number;
  findingsByStatus: Record<FindingStatus, number>;
  publicResources: number;
  externalResources: number;
  findingsList: Finding[];
  ok: boolean;
}

export interface ConsoleOptions {
  now?: string;
  staleFindingAfterDays?: number;
}
