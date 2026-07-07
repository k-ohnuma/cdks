import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { Config } from "./config";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";

export class HealthCheckStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps, config: Config) {
    super(scope, id, props);

    const projectname = "health-check";

    const lambda = new NodejsFunction(this, "fetch", {
      functionName: `${config.resourcePrefix}-${projectname}-${config.env}`,
      runtime: Runtime.NODEJS_24_X,
      timeout: Duration.seconds(300),
      environment: {
        // コンソールから手で設定
        // カンマ区切りでリクエストを投げたいURLを指定
        FETCH_URLS: "",
        // コンソールから手で設定
        // 200以外投げられた時に通知するURL(省略可)
        DISCORD_WEBHOOK_URL: "",
      },
    });
    const rule = new Rule(this, "rule", {
      ruleName: `${config.resourcePrefix}-${projectname}-${config.env}`,
      schedule: Schedule.rate(Duration.minutes(5)),
    });
    rule.addTarget(new LambdaFunction(lambda));
  }
}
