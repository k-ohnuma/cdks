import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { Config } from "./config";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";

export class VirtualContestStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps, config: Config) {
    super(scope, id, props);

    const BASE_NAME = "virtual-contest";
    const lambda = new NodejsFunction(this, "vircon", {
      functionName: `${config.resourcePrefix}-${BASE_NAME}`,
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.minutes(15),
      environment: {
        ACP_BASE_ENDPOINT: config.virtualContest.endpoint,
        CREATE_CONTEST_TITLE: config.virtualContest.contestName,
        TARGET_CONTESTS: config.virtualContest.targetContests.join(","),
      },
      bundling: {
        sourceMap: true,
      },
    });

    // ABCの日はのぞいて20:45に発火
    const rule = new Rule(this, "rule", {
      ruleName: `${config.resourcePrefix}-${BASE_NAME}`,
      schedule: Schedule.cron({
        minute: "45",
        hour: "11",
        weekDay: "SUN-FRI",
      }),
    });

    rule.addTarget(new LambdaFunction(lambda));
  }
}
