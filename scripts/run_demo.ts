import { analyzerLane, findingRisks, summary } from "../src/services/awsIamAccessAnalyzerConsoleService.js";

console.log("aws-iam-access-analyzer-console demo");
console.log(JSON.stringify(summary(), null, 2));
console.log(
  JSON.stringify(
    analyzerLane().map((lane) => ({
      lane: lane.lane,
      owner: lane.owner,
      status: lane.status
    })),
    null,
    2
  )
);
console.log(JSON.stringify(findingRisks().slice(0, 3), null, 2));
