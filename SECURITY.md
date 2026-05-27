# Security Policy

`aws-iam-access-analyzer-console` ships both an offline analyzer and a synthetic public dashboard surface. It reads JSON exports from AWS IAM Access Analyzer (or synthetic data) and emits structured findings, route JSON, and prerendered HTML. No live AWS credential storage, no remote fetch of cloud data, and no execution of user-supplied code is included.

The input can contain account identifiers, role names, bucket names, or trust principals — all sensitive in your cloud environment. Be deliberate about where you store the input and the output.

## Supported versions

Only the latest tagged release is supported.

## Reporting a vulnerability

Please use GitHub Security Advisories for private disclosure:

- [Open a security advisory](https://github.com/mizcausevic-dev/aws-iam-access-analyzer-console/security/advisories/new)

Do not file public issues for security reports.
